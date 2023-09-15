import React from 'react';

const YourComponent = ({ inputObject }) => {
  const renderInputs = () => {
    const inputs = [];

    for (const key in inputObject) {
      if (inputObject.hasOwnProperty(key)) {
        const label = (
          <label key={`label-${key}`}>
            {`${key}:`}
          </label>
        );

        const input = (
          <input
            key={`input-${key}`}
            type="number"
            name={key}
            value={inputObject[key]}
          />
        );

        inputs.push(label, input, <br key={`br-${key}`} />);
      }
    }

    return inputs;
  };

  return (
    <div className="form2">
      {renderInputs()}
    </div>
  );
};

export default YourComponent;
