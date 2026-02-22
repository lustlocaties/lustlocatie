import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';

export default function Careers() {
  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-between fancy-overlay">
      <Header />

      <div className="w-full flex flex-col items-center my-12">
        <section className="w-full p-6 container-narrow">
          <h1 className="text-4xl font-semibold leading-tight md:leading-tight max-w-xs sm:max-w-none md:text-6xl fancy-heading">
            Join the Lustlocaties Team
          </h1>

          <p className="mt-6 md:text-xl">
            At Lustlocaties, we're on a mission to make private stay discovery
            simple and respectful for everyone. We're looking for passionate,
            innovative individuals to help us elevate how couples plan their
            escapes. If you're eager to make an impact and thrive in a dynamic
            environment, we want to hear from you.
          </p>

          <p className="mt-6 md:text-xl">
            Explore opportunities to grow your career with a company dedicated
            to privacy, simplicity, and guest success. Bring your ideas, skills,
            and enthusiasm - together, we can build something extraordinary.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
