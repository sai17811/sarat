import { ExperienceLoader } from '@/components/three/ExperienceLoader';
import { BookButton, ReclinerButton } from '@/components/ui/BookButton';
import { BookingPanel } from '@/components/ui/BookingPanel';
import { EventsForm } from '@/components/ui/EventsForm';
import { Header } from '@/components/ui/Header';
import { Leader } from '@/components/ui/Leader';
import { Poster } from '@/components/ui/Poster';
import { Rail } from '@/components/ui/Rail';
import { ScrollManager } from '@/components/ui/ScrollManager';
import { Showtimes } from '@/components/ui/Showtimes';
import { Ticket } from '@/components/ui/Ticket';
import { Tooltip } from '@/components/ui/Tooltip';

// Server-rendered page: all copy is real HTML for SEO and instant paint.
// Interactive islands are small client components; the 3D loads last.
export default function Home() {
  return (
    <>
      <Leader />
      <ExperienceLoader />
      <Tooltip />
      <Rail />
      <Header />
      <ScrollManager />

      <main>
        <section className="reel hero" id="r1" data-reel="Opening">
          <div className="ghost-te" aria-hidden="true">సారథి</div>
          <div>
            <p className="slate mono fx">Reel 01 · Prasaditya Mall, AVA Road</p>
            <h1><span><i>Sarathi</i></span><span><i>Cinemas</i></span></h1>
            <div className="sub mono fx"><span>6 screens</span><span>1,428 seats</span><span>Barco laser</span><span>Dolby Atmos</span></div>
            <p className="fx">From the family that opened Hyderabad&apos;s first film studio. Scroll to walk into the hall, or pick your seat in 3D.</p>
            <div className="ctas fx">
              <BookButton className="tk">Choose your seat in 3D</BookButton>
              <a className="link" href="#r2">Enter the hall ↓</a>
            </div>
          </div>
        </section>

        <section className="reel" id="r2" data-reel="Now showing">
          <Ticket reel="Reel 02 · Now showing" tag="Nº 0002719">
            <div className="nowgrid">
              <Poster />
              <div>
                <h2>Aakasamlo Oka Tara</h2>
                <p className="meta mono">Telugu · 2D · Dolby Atmos</p>
                <Showtimes />
              </div>
            </div>
            <div className="also">
              {[['[Telugu release]', 'Telugu · 2D'], ['[English release]', 'English · 3D · Atmos'], ['[Hindi release]', 'Hindi · 2D']].map(([t, m]) => (
                <div key={t}><span><strong>{t}</strong>{m}</span><BookButton className="tk dark sm">Times</BookButton></div>
              ))}
            </div>
            <p className="note mono">Showtimes and [bracketed] titles are sample data</p>
          </Ticket>
        </section>

        <section className="reel r" id="r3" data-reel="Experience">
          <Ticket reel="Reel 03 · The experience" tag="Spec sheet">
            <h2>Built like a studio would build it</h2>
            <p>You&apos;re looking back at the projection booth. Every screen runs the kit filmmakers trust.</p>
            <div className="specs">
              <div><b>Barco laser</b><span>Brighter, sharper picture with deeper blacks.</span></div>
              <div><b>Dolby Atmos</b><span>Sound that moves around and above you. The rings overhead show it.</span></div>
              <div><b>Harkness screens</b><span>Silver screens with even brightness, front row to back.</span></div>
              <div><b>6 screens</b><span>1,428 seats under one roof.</span></div>
            </div>
          </Ticket>
        </section>

        <section className="reel" id="r4" data-reel="Recliners">
          <Ticket reel="Reel 04 · Recliners" tag="Rows K–L">
            <h2>Recline. Relax.</h2>
            <p>The gold leather rows at the back are recliners by Little Nap. They&apos;re made for three-hour blockbusters.</p>
            <ReclinerButton />
            <p className="note mono">Any seat in the booking view can show you its view of the screen</p>
          </Ticket>
        </section>

        <section className="reel r" id="r5" data-reel="Our story">
          <Ticket reel="Reel 05 · Our story" tag="Est. 1937">
            <h2>Nearly ninety years of Telugu cinema</h2>
            <ol className="tl">
              <li><b>1937</b><span>Sarathi Films is founded. It goes on to produce classics like Mala Pilla and Rojulu Marayi.</span></li>
              <li><b>1956</b><span>Sri Sarathi Studios opens in Ameerpet as Hyderabad&apos;s first film studio.</span></li>
              <li><b>1959</b><span>Maa Inti Mahalakshmi, the first Telugu film shot entirely in Hyderabad, is made here.</span></li>
              <li><b>Today</b><span>Six laser screens at Prasaditya Mall bring that legacy to Rajahmundry.</span></li>
            </ol>
          </Ticket>
        </section>

        <section className="reel" id="r6" data-reel="Events">
          <Ticket reel="Reel 06 · Private screenings" tag="Whole-screen hire">
            <h2>Your name on the big screen</h2>
            <p>Hire a whole screen for a birthday, a team outing, a college fest or a pre-wedding film. Type a name and watch the screen.</p>
            <EventsForm />
          </Ticket>
        </section>

        <section className="reel r" id="r7" data-reel="Visit">
          <Ticket reel="Reel 07 · Plan your visit" tag="The end">
            <h2>See you at the movies</h2>
            <div className="sheet" aria-label="Photo slots">
              <figure><figcaption>Lobby photo<br />goes here</figcaption></figure>
              <figure><figcaption>Screen photo<br />goes here</figcaption></figure>
              <figure><figcaption>Recliner photo<br />goes here</figcaption></figure>
            </div>
            <div className="facts">
              <span><b>Prasaditya Mall</b>, Survey # 201/1/1A, AVA Road, Rajahmundry, AP 533107</span>
              <span><b>Mall hours:</b> Mon–Sun, 11:00 AM – 11:00 PM (show timings vary)</span>
              <span><b>Mall reception:</b> +91 883 244 3555</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center' }}>
              <BookButton className="tk">Book seats</BookButton>
              <a className="link" style={{ color: 'var(--paper-ink)', borderColor: 'rgba(27,20,16,.4)' }} href="https://www.google.com/maps/search/?api=1&query=Prasaditya+Mall+Rajahmundry">Directions ↗</a>
            </div>
            <div className="fine mono"><span>Promoted by Sri Sarathi Studios</span><span>Built by DrevenForge</span></div>
          </Ticket>
        </section>
      </main>

      <BookingPanel />
    </>
  );
}
