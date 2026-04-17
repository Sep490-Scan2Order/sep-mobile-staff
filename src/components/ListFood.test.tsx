import React from 'react';
import { render } from '@testing-library/react-native';
import { ListFood } from './ListFood';
describe('ListFood', () => {
  const mockItem = {
    id: 'item-1',
    name: 'Mì Quảng',
    price: 35000,
    quantity: 2,
    image: 'https://example.com/mi-quang.jpg',
    subTotal: 70000,
    promotionName: 'Giam giá 10%',
    originalPrice: 38000,
    discountAmount: 3000,
  };
  it('renders item details correctly', () => {
    const { getByText, UNSAFE_getByType } = render(<ListFood item={mockItem} />);
    const { Image } = require('react-native');
    expect(getByText('Mì Quảng')).toBeTruthy();
    expect(getByText('35,000 đ')).toBeTruthy();
    expect(getByText('x2')).toBeTruthy();
    expect(getByText('70,000 đ')).toBeTruthy();
    expect(getByText('Giam giá 10%')).toBeTruthy();
    expect(getByText('38,000 đ')).toBeTruthy(); 
    expect(getByText('-3,000 đ khuyến mãi')).toBeTruthy();
    const image = UNSAFE_getByType(Image);
    expect(image.props.source).toEqual({ uri: mockItem.image });
  });
  it('renders correctly without promotion', () => {
    const simpleItem = { ...mockItem, promotionName: '', originalPrice: 0, discountAmount: 0 };
    const { getByText, queryByText } = render(<ListFood item={simpleItem} />);
    expect(getByText('Mì Quảng')).toBeTruthy();
    expect(queryByText('Giam giá 10%')).toBeNull();
    expect(queryByText(/38,000 đ/)).toBeNull();
  });
});
