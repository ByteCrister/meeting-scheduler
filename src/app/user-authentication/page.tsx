import DefaultAuthPage from '@/components/authentication/DefaultAuthPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Authentication',
};

const Default = () => {
  return (
    <DefaultAuthPage />
  )
}

export default Default