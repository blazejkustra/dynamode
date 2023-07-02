import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import CodeBlock from '@theme/CodeBlock';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const heroImageUrl = 'img/dynamodb-logo.svg';
const sectionImageUrl = 'img/engine_frame.svg';

const bareDdbCode = `const response = await DynamoDB.getItem({
  TableName: 'users',
  Key: {
    PK: { S: 'blazej' },
    SK: { S: 'nwjła7pa31e2' },
  },
  ProjectionExpression: 'username, #object'
  ExpressionAttributeNames: { '#object': 'object' },
});
const user = response?.Item; // can be undefined
`;

const dynamodeCode = `const user = await UserManager.get({ 
  PK: 'blazej', 
  SK: 'nwjła7pa31e2', 
}, { attributes: ['object', 'username'] });
`;

const boxes = [
  {
    title: <React.Fragment>DynamoDB easier than ever before</React.Fragment>,
    description: (
      <React.Fragment>
        Complexity reduced from tens to just a few classes and methods. Check out the{' '}
        <a href="docs/getting_started/introduction">Documentation</a> and try it out today.
      </React.Fragment>
    ),
  },
  {
    title: <React.Fragment>It is all about Typescript</React.Fragment>,
    description: (
      <React.Fragment>
        Designed with typescript in mind from the beginning. It includes strongly typed classes and methods, query and
        scan builders, and much more.
      </React.Fragment>
    ),
  },
  {
    title: <React.Fragment>Object-oriented solution</React.Fragment>,
    description: (
      <React.Fragment>
        Dynamode's goal is to provide a better development experience while using DynamoDB. That's why we choose
        class-based approach to model your application data.
      </React.Fragment>
    ),
  },
  {
    title: <React.Fragment>Understandable overlay over DynamoDB</React.Fragment>,
    description: (
      <React.Fragment>
        Dynamode isn't a black box. It overlays all crucial DynamoDB functions and gives it a little touch that makes
        using Dynamode more pleasant.
      </React.Fragment>
    ),
  },
];

const exampleUrl = 'https://github.com/blazejkustra/dynamode';
const playgroundUrl = 'https://github.com/blazejkustra/dynamode';

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
          <div className="col col--12 hero-content" style={{ backgroundImage: `url(${heroImageUrl})` }}>
            <h1 className="hero__title">{siteConfig.title}</h1>
            <p className="hero__p">{siteConfig.tagline}</p>
            <Link
              className={classnames('button button--primary button--lg', styles.getStarted)}
              to={useBaseUrl('docs/getting_started/introduction')}
            >
              View Docs
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function SectionInfo() {
  return (
    <React.Fragment>
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
      />
    </React.Fragment>
  );
}

function Home() {
  return (
    <Layout title="DynamoDB ODM" description="Modeling tool for Amazon's DynamoDB">
      <Hero />
      <main>
        <section className="landing-container">
          <div className="container">
            <div className={`row row--box-section ${classnames('row', styles.row)}`}>
              <SectionInfo />
            </div>
          </div>
        </section>
        <section className="landing-container">
          <div className="container container--center">
            <div className={`row row--center ${classnames('row', styles.row)}`}>
              <div className="col col--7 text--center col--bottom-section">
                <h2>Easier. Better. Faster.</h2>
                <p>
                  Learn how to quickly get up and running with Dynamode. Go to{' '}
                  <a href="docs/getting_started/introduction">Getting started page</a> to see how you can run it locally
                  along with local DynamoDB instance.
                </p>
                <h3>Bare DynamoDB</h3>
                <CodeBlock className={`language-ts ${classnames('codeBlock', styles.codeBlock)}`}>
                  {bareDdbCode}
                </CodeBlock>
                <h3>with Dynamode</h3>
                <CodeBlock className={`language-ts ${classnames('codeBlock', styles.codeBlock)}`}>
                  {dynamodeCode}
                </CodeBlock>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
