import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';

export default function Features() {
  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-between fancy-overlay">
      <Header />

      <div className="w-full flex flex-col items-center my-12">
        <section className="w-full p-6 container-narrow">
          <h1 className="text-4xl font-semibold leading-tight md:leading-tight max-w-xs sm:max-w-none md:text-6xl fancy-heading">
            Powerful Features for Discreet Stays
          </h1>

          <p className="mt-6 md:text-xl">
            Discover how Lustlocaties makes planning private stays effortless.
            From curated discovery to privacy-focused filters, our features are
            designed to help you find the right place with ease.
          </p>

          <p className="mt-6 md:text-xl">
            Whether you're planning a quiet weekend or a special escape, our
            platform offers a seamless and secure experience. Sign up for free
            today and start planning your next stay.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
