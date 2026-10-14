import { renderWithProviders, screen } from '@/test/render';
import { Text } from 'react-native';
import { Card } from './Card';

describe('Card', () => {
  it('renders its title and children', async () => {
    await renderWithProviders(
      <Card title="Goal">
        <Text>75 kg</Text>
      </Card>,
    );
    expect(screen.getByText('Goal')).toBeOnTheScreen();
    expect(screen.getByText('75 kg')).toBeOnTheScreen();
  });

  it('renders no title when none is given', async () => {
    await renderWithProviders(
      <Card>
        <Text>Body</Text>
      </Card>,
    );
    expect(screen.queryByText('Goal')).not.toBeOnTheScreen();
  });
});
