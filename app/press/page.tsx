import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';

export default function Press() {
  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-between fancy-overlay">
      <Header />

      <div className="w-full flex flex-col items-center my-12">
        <section className="w-full p-6 container-narrow">
          <h1 className="text-4xl font-semibold leading-tight md:leading-tight max-w-xs sm:max-w-none md:text-6xl fancy-heading">
            Lustlocaties in the News
          </h1>

          <p className="mt-6 md:text-xl">
            At Lustlocaties, we're redefining how couples discover discreet
            stays. Our platform highlights privacy-first listings, verified
            reviews, and thoughtful filters so you can book with confidence.
          </p>

          <p className="mt-6 md:text-xl">
            Our commitment is to empower guests with safe, simple, and
            respectful tools for planning private moments. As we continue to
            grow, we're proud to be recognized for our privacy-first approach
            and dedication to guest experience.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
