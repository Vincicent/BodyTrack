export type DateFieldProps = {
  label: string;
  value: Date;
  onChange: (d: Date) => void;
  maximumDate?: Date;
};
