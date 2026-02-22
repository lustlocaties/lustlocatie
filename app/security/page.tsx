import Footer from '@/components/shared/Footer';
import Header from '@/components/shared/Header';

export default function Security() {
  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-between fancy-overlay">
      <Header />

      <div className="w-full flex flex-col items-center my-12">
        <section className="w-full p-6 container-narrow">
          <h1 className="text-4xl font-semibold leading-tight md:leading-tight max-w-xs sm:max-w-none md:text-6xl fancy-heading">
            Your Security is Our Priority
          </h1>

          <p className="mt-6 md:text-xl">
            At Lustlocaties, we understand that planning private stays requires
            trust. That is why we employ industry-leading security measures to
            protect your personal information and booking activity. From
            encrypted connections to secure data storage, your safety is our top
            concern.
          </p>

          <p className="mt-6 md:text-xl">
            Our platform is designed with your privacy in mind, ensuring your
            profile and preferences are safeguarded. Focus on discovering
            discreet stays and planning your getaway with confidence, knowing
            that security is built into every detail of our service.
          </p>
        </section>
      </div>

      <Footer />
    </div>
  );
}
