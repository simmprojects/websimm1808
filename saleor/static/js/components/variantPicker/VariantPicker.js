import _ from 'lodash';
import $ from 'jquery';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import AttributeSelectionWidget from './AttributeSelectionWidget';
//import QuantityInput from './QuantityInput';
import * as queryString from 'query-string';

export default observer(class VariantPicker extends Component {
  static propTypes = {
    onAddToCartError: PropTypes.func.isRequired,
    onAddToCartSuccess: PropTypes.func.isRequired,
    store: PropTypes.object.isRequired,
    url: PropTypes.string.isRequired,
    variantAttributes: PropTypes.array.isRequired,
    variants: PropTypes.array.isRequired
  };

  constructor (props) {
    super(props);
    const { variants } = this.props;

    const variant = variants.filter(v => !!Object.keys(v.attributes).length)[0];
    const params = queryString.parse(location.search);
    let selection = {};
    if (Object.keys(params).length) {
      Object.keys(params)
        .some((name) => {
          const valueName = params[name];
          const attribute = this.matchAttributeBySlug(name);
          const value = this.matchAttributeValueByName(attribute, valueName);
          if (attribute && value) {
            selection[attribute.pk] = value.pk.toString();
          } else {
            // if attribute doesn't exist - show variant
            selection = variant ? variant.attributes : {};
            // break
            return true;
          }
        });
    } else if (Object.keys(variant).length) {
      selection = variant.attributes;
    }
    let disabledValues = this.matchVariantFromSelection(selection);
    this.state = {
      errors: {},
      quantity: 1,
      selection: selection,
      typeSelection: "Upload File",
      param_file_disabled: disabledValues[0],
      draw_molecule_disabled: disabledValues[1],
      upload_file: null,
      draw_showed: false,
      style: "",
      molecule_value: "No Molecule Input."
    };
  }

  checkVariantAvailability = () => {
    const { store } = this.props;
    return store.variant.availability;
  };

  handleAddToCart = () => {
    const { onAddToCartSuccess, onAddToCartError, store } = this.props;
    const { quantity, upload_file, molecule_value } = this.state;
      let molecule = $('#id_molecule').val();
      var flag = false;
      if((typeof(molecule) != "undefined" && molecule != "No Molecule Input.") || upload_file != null){
        flag = true;
      }
      if (quantity > 0 && !store.isEmpty && flag) {
        var formData = new FormData();
        formData.append('quantity', quantity)
        formData.append('variant', store.variant.id)
        formData.append('upload_file', upload_file)
        let molecule = $('#id_molecule').val();
        formData.append('molecule_value', molecule)

        $.ajax({
          url: this.props.url,
          method: 'POST',
          contentType: false,
          processData: false,
          data: formData,
          success: () => {
            onAddToCartSuccess();
          },
          error: (response) => {
            onAddToCartError(response);
          }
        });
      }
      else{
        this.handleParameterErrors(-1);
      }
  };

  handleAttributeChange = (attrId, valueId) => {
    this.resetParameters();

    this.setState({
      selection: Object.assign({}, this.state.selection, { [attrId]: valueId })
    }, () => {
      let disabledValues = this.matchVariantFromSelection(this.state.selection);
      this.setState({ param_file_disabled: disabledValues[0], draw_molecule_disabled: disabledValues[1] })
      let params = {};
      Object.keys(this.state.selection)
        .forEach(attrId => {
          const attribute = this.matchAttribute(attrId);
          const value = this.matchAttributeValue(attribute, this.state.selection[attrId]);
          if (attribute && value) {
            params[attribute.slug] = value.slug;
          }
        });
      history.pushState(null, null, '?' + queryString.stringify(params));
    });
  };

  handleTypeChange = (value) => {
    this.resetParameters();

    this.setState({
      typeSelection: value
    }, () => {
      if (value == "Draw Online") {
        this.setState({ draw_showed: true })
      }
      else {
        this.setState({ draw_showed: false })
      }
    });
  };

  handleDrawChange = () => {
    this.resetParameters();
  
    window.open('draw_molecule','Draw Molecule','width=500,height=450,scrollbars=no,resizable=yes');
  };

  handleFileChange = (event, type_allowed) => {
    this.resetParameters();
    
    if (type_allowed){
      const file = event.target.files[0];
      this.setState({ upload_file: file })
    }
  };
  
  handleParameterErrors = (error_type) => {
    let warning = document.getElementById("warning");
    if (error_type == 0){
      warning.innerHTML = "File Type Not Supported.";
      return false;
    }
    if (error_type == -1){
      warning.innerHTML = "Please Set Parameters.";
      return false;
    }
    return true;
  };

  matchAttribute = (id) => {
    const { variantAttributes } = this.props;
    const match = variantAttributes.filter(attribute => attribute.pk.toString() === id);
    return match.length > 0 ? match[0] : null;
  };

  matchAttributeBySlug = (slug) => {
    const { variantAttributes } = this.props;
    const match = variantAttributes.filter(attribute => attribute.slug === slug);
    return match.length > 0 ? match[0] : null;
  };

  matchAttributeValue = (attribute, id) => {
    const match = attribute.values.filter(attribute => attribute.pk.toString() === id);
    return match.length > 0 ? match[0] : null;
  };

  matchAttributeValueByName = (attribute, name) => {
    const match = attribute ? attribute.values.filter(value => value.slug === name) : [];
    return match.length > 0 ? match[0] : null;
  };

  matchVariantFromSelection(selection) {
    const { store, variants } = this.props;
    let matchedVariant = null;
    variants.forEach(variant => {
      if (_.isEqual(selection, variant.attributes)) {
        matchedVariant = variant;
      }
    });
    store.setVariant(matchedVariant);
    const disabledValue1 = !matchedVariant.needupload;
    const disabledValue2 = !matchedVariant.draw;
    return [disabledValue1, disabledValue2]
  }

  matchTypeFromSelection(selection) {
    const { store, variants } = this.props;
    let matchedVariant = null;
    variants.forEach(variant => {
      if (_.isEqual(selection, variant.attributes)) {
        matchedVariant = variant;
      }
    });
    const disabledValue = !matchedVariant.draw;
    return disabledValue
  }

  resetParameters(){
    let warning = document.getElementById("warning");
    warning.innerHTML = "";
    this.setState({ upload_file: null });
    $('#id_molecule').text('');
  }

  render () {
    const { store, variantAttributes } = this.props;
    const { errors, selection, typeSelection, param_file_disabled, upload_file, draw_molecule_disabled, draw_showed, molecule_value, style } = this.state;
    const disableAddToCart = store.isEmpty || !this.checkVariantAvailability();

    const addToCartBtnClasses = classNames({
      'btn primary': true,
      'disabled': disableAddToCart
    });

    return (
      <div>
        <AttributeSelectionWidget
          errors={errors.upload_file}
          variantAttributes={variantAttributes}
          selection={selection}
          typeSelection={typeSelection}
          handleAttributeChange={this.handleAttributeChange}
          param_file_disabled={param_file_disabled}
          draw_molecule_disabled={draw_molecule_disabled}
          handleFileChange={this.handleFileChange}
          handleTypeChange={this.handleTypeChange}
          draw_showed={draw_showed}
          handleDrawChange={this.handleDrawChange}
          molecule_value={molecule_value}
          upload_file={upload_file}
          handleParameterErrors={this.handleParameterErrors}
        />
        <div className="variant-picker__warning"><span id="warning"></span></div>
        <div className="clearfix">
          <div className="form-group">
            <button
              className={addToCartBtnClasses}
              onClick={this.handleAddToCart}
              disabled={disableAddToCart}>
              {pgettext('Product details primary action', 'Add to cart')}
            </button>
          </div>
        </div>
      </div>
    );
  }
});
