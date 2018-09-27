import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class AttributeSelectionWidget extends Component {

  static propTypes = {
    errors: PropTypes.array,
    variantAttributes: PropTypes.object.isRequired,
    selection: PropTypes.object.isRequired,
    handleAttributeChange: PropTypes.func.isRequired,
    param_file_disabled: PropTypes.bool.isRequired,
    handleFileChange: PropTypes.func.isRequired
  };

  handleChange = (attrPk, valuePk) => {
    this.props.handleAttributeChange(attrPk.toString(), valuePk.toString());
  }

  render() {
    const { errors, variantAttributes, selection, param_file_disabled } = this.props;
    return (
      <div className="variant-picker">
        {variantAttributes.map((attribute, i) => {
          return (
            <div>
              <div className="variant-picker__label">{attribute.name}</div>
              <div className="btn-group" data-toggle="buttons">
                {attribute.values.map((value, i) => {
                  const active = selection[attribute.pk] === value.pk.toString();
                  const labelClass = classNames({
                    'btn btn-secondary variant-picker__option': true,
                    'active': active
                  });
                  return (
                    <label
                      className={labelClass}
                      key={i}
                      onClick={() => this.handleChange(attribute.pk, value.pk)}>
                      <input
                        defaultChecked={active}
                        name={value.pk}
                        type="radio" />
                      {value.name}
                    </label>
                  );
                }
                )}
              </div>
            </div>
          );
        }
        )}
        <div className="variant-picker__label">Parameter File</div>
        {param_file_disabled ?
          (
            <label>No Parameter File Needed.</label>
          )
          :
          (
            <input
              id="id_param_file"
              type="file"
              accept="text/csv, aplication/zip, text/plain"
              disabled={param_file_disabled}
              onChange={this.props.handleFileChange}
            />
          )
        }
        {errors && (
          <span className="help-block">{errors.join(' ')}</span>
        )}
      </div>
    );
  }
}
