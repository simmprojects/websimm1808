import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class AttributeSelectionWidget extends Component {

  static propTypes = {
    errors: PropTypes.array,
    variantAttributes: PropTypes.object.isRequired,
    selection: PropTypes.object.isRequired,
    typeSelection: PropTypes.object.isRequired,
    handleAttributeChange: PropTypes.func.isRequired,
    param_file_disabled: PropTypes.bool.isRequired,
    draw_molecule_disabled: PropTypes.bool.isRequired,
    draw_showed: PropTypes.bool.isRequired,
    handleFileChange: PropTypes.func.isRequired,
    handleTypeChange: PropTypes.func.isRequired,
    handleDrawChange: PropTypes.func.isRequired
  };

  handleChange = (attrPk, valuePk) => {
    this.props.handleAttributeChange(attrPk.toString(), valuePk.toString());
  }

  handleChangeType = (value) => {
    this.props.handleTypeChange(value);
  }

  render() {
    const { errors, variantAttributes, selection, typeSelection, param_file_disabled, draw_molecule_disabled, draw_showed, molecule_value } = this.props;

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
        <div className="variant-picker__label">Parameters</div>
        {param_file_disabled ?
          (
            <label>No Parameters Needed.</label>
          )
          :
          (
            <div>
              {draw_molecule_disabled ?
                (
                  <input
                    id="id_param_file"
                    type="file"
                    accept="text/csv, aplication/zip, text/plain"
                    disabled={param_file_disabled}
                    onChange={this.props.handleFileChange}
                  />
                )
                :
                (
                  <div>
                    <div className="btn-group" data-toggle="buttons">
                      {["Draw Online", "Upload File"].map((value) => {
                        const active = typeSelection == value;
                        const labelClass = classNames({
                          'btn btn-secondary variant-picker__option': true,
                          'active': active
                        });
                        return (
                          <label
                            className={labelClass}
                            onClick={() => this.handleChangeType(value)}>
                            <input
                              defaultChecked={active}
                              name={value}
                              type="radio" />
                            {value}
                          </label>
                        );
                      })}
                    </div>
                    {draw_showed ?
                      (
                        <div>
                          <label>Molecule:</label>
                          <input
                            id="id_molecule"
                            type="text"
                            onClick={this.props.handleDrawChange}
                            value={molecule_value}
                            readOnly="readOnly"
                          />
                        </div>
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
                  </div>
                )
              }
            </div>
          )
        }
        {errors && (
          <span className="help-block">{errors.join(' ')}</span>
        )}
      </div>
    );
  }
}
