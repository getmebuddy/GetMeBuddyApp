import React from 'react';

const MockSvgComponent: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  return React.createElement('svg', props, null);
};

export const ReactComponent = MockSvgComponent;
export default MockSvgComponent;
