import Lottie from 'lottie-react';
import loaderAnimation from '@/public/loader.json';

export const Loader = () => {
  return (
    <div className="min-h-[30vh] w-full flex items-center justify-center">
      <div className="w-24 h-24">
        <Lottie animationData={loaderAnimation} loop={true} />
      </div>
    </div>
  );
};
