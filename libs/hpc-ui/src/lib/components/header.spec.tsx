import React from 'react';
import { render } from '@testing-library/react';

import Header from './header';

describe(' Ui', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Header />);
    expect(baseElement).toBeTruthy();
  });
});
