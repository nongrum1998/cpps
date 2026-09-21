export const Ternary = ({
  condition,
  ifTrue,
  ifFalse,
}: {
  condition: boolean;
  ifTrue: React.ReactNode;
  ifFalse: React.ReactNode;
}) => {
  return condition ? ifTrue : ifFalse;
};
