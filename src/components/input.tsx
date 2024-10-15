import { Option, Options } from '@/module/type';
import { CSSProperties } from 'react';

type SelectProps = {
  options?: Options;
  value?: Option;
  onChange?: (value: Option) => void;
  disabled?: boolean;
  visible?: boolean;
  style?: CSSProperties;
};

/**
 * Select component
 * @returns
 */
export function Select({
  options = [{ label: '', value: '' }],
  value,
  style,
  onChange = () => null,
  disabled = false,
  visible = true,
}: SelectProps) {
  const optionsComponents = options.map((dict, index) => {
    const { value, label } = dict;
    return <option value={value} label={label} key={index} />;
  });

  return (
    <select
      value={value?.value || options[0]?.value}
      style={{
        display: visible ? 'flex' : 'none',
        ...style,
      }}
      disabled={disabled}
      onChange={(e) => {
        onChange(options[e.target.selectedIndex]);
      }}
    >
      {optionsComponents}
    </select>
  );
}
