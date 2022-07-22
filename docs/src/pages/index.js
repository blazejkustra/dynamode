import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const heroImageUrl = 'img/engine_frame.svg';
const sectionImageUrl = 'img/dynamodb-logo.svg';

const boxes = [
  {
    title: <>Use DynamoDB with more ease than ever before</>,
    description: (
      <>
        Complexity reduced from tens to just a few classes and methods. Try it out today: Check out our{' '}
        <a href="docs/getting_started/introduction">Documentation</a>.
      </>
    ),
  },
  {
    title: <>Lorem ipsum dolor sit amet consectetur, adipisicing elit. </>,
    description: (
      <>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ea nostrum inventore nihil expedita fugiat dignissimos
        itaque nobis, officiis aliquid ex provident deserunt laborum quos.
      </>
    ),
  },
];

const exampleUrl = 'https://github.com/blazejkustra/dynamode';
const playgroundUrl = 'https://github.com/blazejkustra/dynamode';
const tryItOutDescription =
  'Check out the documentation and learn how to quickly get up and running with Dynamode. Take a look at our API guides to familiarize with the API.';

function InfoBox({ title, description }) {
  return (
    <div className="col col--6 info-box">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Hero() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <header className={classnames('hero hero--secondary', styles.heroBanner)}>
      <div className="container">
        <div className={`row row-hero ${classnames('row', styles.row)}`}>
          <div className="col col--5 hero-content">
            <h1 className="hero__title">{siteConfig.title}</h1>
            <p className="hero__p">{siteConfig.tagline}</p>
            <div className={classnames('hero-buttons', styles.buttons)}>
              <Link
                className={classnames('button button--primary button--lg', styles.getStarted)}
                to={useBaseUrl('docs/getting_started/introduction')}
              >
                View Docs
              </Link>
            </div>
          </div>
          <div
            className="col col--7 hero-image"
            style={{
              backgroundImage: `url(${heroImageUrl})`,
            }}
          ></div>
        </div>
      </div>
    </header>
  );
}

function SectionInfo() {
  return (
    <>
      <div className="col col--8 section-boxes">
        {boxes && boxes.length > 0 && (
          <div className={`row box-container ${classnames('row', styles.row)}`}>
            {boxes.map((props, idx) => (
              <InfoBox key={idx} {...props} />
            ))}
          </div>
        )}
      </div>
      <div
        className="col col--4 section-image"
        style={{
          backgroundImage: `url(${sectionImageUrl})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>
    </>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout title={`Hello from ${siteConfig.title}`} description="Description will go into a meta tag in <head />">
      <Hero />

      <main>
        <section>
          <div className="container">
            <div className={`row row--box-section ${classnames('row', styles.row)}`}>
              <SectionInfo />
            </div>
          </div>
        </section>
        <section>
          <div className="container container--center">
            <div className={`row row--center ${classnames('row', styles.row)}`}>
              <div className="col col--7 text--center col--bottom-section">
                <h2>Try it out</h2>
                <p>{tryItOutDescription}</p>
                <div
                  className="section-image"
                  style={{
                    backgroundImage: `url(${sectionImageUrl})`,
                    backgroundSize: 'contain',
                    backgroundPosition: 'center center',
                    backgroundRepeat: 'no-repeat',
                    margin: '1rem',
                  }}
                ></div>
                <p>
                  Or just go to <a href="docs/getting_started/introduction">Documentation page</a> to see how you can
                  run it locally along with local DynamoDB instance.
                </p>
                <div>
                  <Link className={classnames('button button--primary button--lg', styles.getStarted)} to={exampleUrl}>
                    Example on GitHub
                  </Link>

                  <Link
                    className={classnames('button button--primary button--lg', styles.getStarted)}
                    to={playgroundUrl}
                  >
                    Playground App
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section>
          <div className="container">
            <div className={`row row--center ${classnames('row', styles.row)}`}>
              <div className="col col--7 text--center col--bottom-section">
                <h2>Sponsors</h2>
                <p>
                  We really appreciate our sponsors! Thanks to them we can develop our library and make the working with
                  DynamoDB much easier. Special thanks for:
                </p>
                <div className={`row row--center ${classnames('row', styles.row)}`}>
                  <a href="https://www.swmansion.com">
                    <img className="imageHolder-sponsor" src="img/swm-logo-small.svg" />
                    <h5>Software Mansion</h5>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
