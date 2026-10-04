import {
  Features,
  HowItWorks,
  LandingFooter,
  LandingHeader,
  LandingHero,
  StartBand
} from './components';

/* The signed-out home page */
export const Landing = () => (
  <div id="top">
    <LandingHeader />
    <main>
      <LandingHero />
      <HowItWorks />
      <Features />
      <StartBand />
    </main>
    <LandingFooter />
  </div>
);
