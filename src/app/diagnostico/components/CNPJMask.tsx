import React from "react";
import { IMaskInput } from 'react-imask';

interface CNPJMaskCustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const CNPJMask = React.forwardRef<HTMLInputElement, CNPJMaskCustomProps>(
  function CNPJMask(props, ref) {
    const { onChange, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask="00.000.000/0000-00"
        definitions={{
          '#': /[1-9]/,
        }}
        inputRef={ref}
        onAccept={(value: any) => 
          onChange({ target: { name: props.name, value: value.toString() } })
        }
        overwrite
      />
    );
  },
);

export default CNPJMask;
