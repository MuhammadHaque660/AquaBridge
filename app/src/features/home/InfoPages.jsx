/** Content pages linked from the header and footer: How it works, Accessibility, Privacy, Contact. */
import { Link } from 'react-router';
import { Warning } from '../../shared/components/Feedback';
import { cx, page, readable } from '../../shared/styles';
import { Steps } from './HomePage';

const prose = cx(readable, 'grid gap-4 [&_h2]:mt-6 [&_li]:mb-1 [&_ul]:list-disc [&_ul]:pl-6');

function Article({ title, lede, children, aside }) {
  return (
    <div className={page}>
      <div className="grid grid-cols-[minmax(0,1fr)_260px] gap-16 max-lg:grid-cols-1 max-lg:gap-8">
        <article className={prose}>
          <h1>{title}</h1>
          {lede && <p className="text-ink-2 text-lg">{lede}</p>}
          {children}
        </article>
        {aside && <aside className="lg:pt-2">{aside}</aside>}
      </div>
    </div>
  );
}

const Contents = ({ items }) => (
  <nav aria-label="Contents" className="grid gap-2 lg:sticky lg:top-24">
    <h2 className="text-md">Contents</h2>
    <ul className="border-line m-0 grid list-none gap-2 border-l-2 p-0 pl-4 text-sm">
      {items.map(([id, t]) => (
        <li key={id}>
          <a href={`#${id}`}>{t}</a>
        </li>
      ))}
    </ul>
  </nav>
);

export function HowItWorksPage() {
  return (
    <Article
      title="How AquaBridge works"
      lede="AquaBridge helps people who can no longer keep aquarium or pond animals and plants find them a suitable new home, and helps adopters check they can care for them first. It is free, and nothing is bought or sold."
      aside={
        <Contents
          items={[
            ['rehoming', 'Rehoming yours'],
            ['adopting', 'Adopting'],
            ['never-release', 'Never release them'],
            ['why', 'Why it matters'],
          ]}
        />
      }
    >
      <section id="rehoming" tabIndex={-1} className="grid gap-4 focus:outline-none">
        <h2>Rehoming yours</h2>
        <p>You do not need an account to start. You only sign in when you are ready to publish a listing.</p>
        <Steps
          items={[
            ['Answer a few questions', 'What it is, how many, its health, where you are and how soon it needs to go.'],
            [
              'Read your guidance',
              'We tell you whether it can be listed. If it cannot, we explain why and suggest what to do instead.',
            ],
            ['Publish your listing', 'Your answers fill in most of the listing. You add a title and a description.'],
            ['Choose an adopter', 'Each request includes an introduction and a summary of the adopter’s tank or pond.'],
            ['Confirm the handover', 'The listing closes once you and the adopter have both confirmed it happened.'],
          ]}
        />
        <p>
          <Link to="/rehome" className="font-semibold">
            Start rehoming
          </Link>
        </p>
      </section>

      <section id="adopting" tabIndex={-1} className="grid gap-4 focus:outline-none">
        <h2>Adopting</h2>
        <Steps
          items={[
            ['Browse listings', 'No account needed. Filter by animals or plants, and by aquarium or pond.'],
            ['Read the care needs', 'Each listing shows the temperature, pH and minimum tank size the species needs.'],
            ['Save your tank or pond', 'Enter its details once and reuse them for every listing.'],
            [
              'Check compatibility',
              'We compare your setup with the care needs and explain anything that does not match.',
            ],
            [
              'Send a request',
              'If it is a potential match, introduce yourself to the owner and follow the request from your account.',
            ],
          ]}
        />
        <p>
          A compatibility result is a guide, not a guarantee. Always talk to the owner about the details before you
          collect.
        </p>
        <p>
          <Link to="/browse" className="font-semibold">
            Browse listings
          </Link>
        </p>
      </section>

      <section id="never-release" tabIndex={-1} className="grid gap-4 focus:outline-none" data-tour="never-release">
        <h2>Never release them</h2>
        <Warning>Do not release aquarium or pond animals or plants into rivers, lakes, ponds or drains.</Warning>
        <p>
          Released fish and plants can carry disease and spread quickly through waterways. Some, such as red-eared
          sliders and parrot’s feather, are listed as invasive in England and Wales, and releasing them is an offence.
        </p>
        <p>If you cannot keep something and it cannot be listed:</p>
        <ul>
          <li>keep caring for it where it is for now</li>
          <li>ask a local aquatic shop or fishkeeping club whether they take in rehomes</li>
          <li>contact a specialist rescue or your local authority for advice</li>
          <li>read the GOV.UK guidance on invasive non-native species</li>
        </ul>
      </section>

      <section id="why" tabIndex={-1} className="grid gap-4 focus:outline-none">
        <h2>Why it matters</h2>
        <p>
          AquaBridge supports the UN Sustainable Development Goal 14, Life below water. Every animal or plant that goes
          to a suitable home instead of being released is one less risk to native rivers and ponds.
        </p>
      </section>
    </Article>
  );
}

export function AccessibilityPage() {
  return (
    <Article title="Accessibility" lede="We want everyone to be able to use AquaBridge.">
      <p>This prototype aims to meet WCAG 2.2 AA. You should be able to:</p>
      <ul>
        <li>use every page with a keyboard, with a visible focus outline</li>
        <li>zoom to 400% without content being cut off</li>
        <li>use it on a phone, in a single column</li>
        <li>use it with a screen reader: errors, statuses and confirmations are announced</li>
      </ul>
      <p>
        The body text uses Atkinson Hyperlegible, a typeface designed by the Braille Institute to be easier to read for
        people with low vision.
      </p>
      <h2>Known issues</h2>
      <p>The species pictures are illustrations. Real listings will need photos with text descriptions.</p>
      <p>
        If you find a problem, <Link to="/contact">tell us</Link>.
      </p>
    </Article>
  );
}

export function PrivacyPage() {
  return (
    <Article title="Privacy" lede="This is a prototype. It stores sample data in your browser only.">
      <p>
        Nothing you enter is sent to a server. Listings, habitats and requests are saved in this browser’s local storage
        so the demo keeps working when you reload.
      </p>
      <p>You can clear everything with “Reset sample data” in the footer.</p>
      <h2>In the real service</h2>
      <p>
        Adopters will only ever see a listing’s town and postcode district. Owners will see a summary of an adopter’s
        tank or pond, never their address or private habitat names.
      </p>
    </Article>
  );
}

export function ContactPage() {
  return (
    <Article title="Contact" lede="AquaBridge is a student project for CS2701 (Group B14).">
      <p>For questions about the prototype, contact the AquaBridge team. The product owner is Shawn D’Souza.</p>
      <p>For problems with an animal’s health, contact a vet with fish experience.</p>
    </Article>
  );
}
