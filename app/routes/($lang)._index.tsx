import {defer, type LoaderArgs} from '@shopify/remix-oxygen';
import {Suspense} from 'react';
import {Await, useLoaderData} from '@remix-run/react';
import {
  ProductSwimlane,
  FeaturedCollections,
  Hero,
  Section,
  Button,
} from '~/components';
import {MEDIA_FRAGMENT, PRODUCT_CARD_FRAGMENT} from '~/data/fragments';
import {getHeroPlaceholder} from '~/lib/placeholders';
import {seoPayload} from '~/lib/seo.server';
import type {
  CollectionConnection,
  ProductConnection,
} from '@shopify/hydrogen/storefront-api-types';
import {AnalyticsPageType} from '@shopify/hydrogen';
import {routeHeaders, CACHE_SHORT} from '~/data/cache';
import {type CollectionHero} from '~/components/Hero';
import PlaceholderImg from '../../public/placeholder-img.jpeg';
import ButtonEyeClosedIcon from '../../public/eye-closed.svg';
import FlowerImg from '../../public/flowers.png';
import TreeImg from '../../public/tree.png';

interface HomeSeoData {
  shop: {
    name: string;
    description: string;
  };
}

export const headers = routeHeaders;

export async function loader({params, context}: LoaderArgs) {
  const {language, country} = context.storefront.i18n;

  if (
    params.lang &&
    params.lang.toLowerCase() !== `${language}-${country}`.toLowerCase()
  ) {
    // If the lang URL param is defined, yet we still are on `EN-US`
    // the the lang param must be invalid, send to the 404 page
    throw new Response(null, {status: 404});
  }

  const {shop, hero} = await context.storefront.query<{
    hero: CollectionHero;
    shop: HomeSeoData;
  }>(HOMEPAGE_SEO_QUERY, {
    variables: {handle: 'freestyle'},
  });

  const seo = seoPayload.home();

  return defer(
    {
      shop,
      primaryHero: hero,
      // These different queries are separated to illustrate how 3rd party content
      // fetching can be optimized for both above and below the fold.
      featuredProducts: context.storefront.query<{
        products: ProductConnection;
      }>(HOMEPAGE_FEATURED_PRODUCTS_QUERY, {
        variables: {
          /**
           * Country and language properties are automatically injected
           * into all queries. Passing them is unnecessary unless you
           * want to override them from the following default:
           */
          country,
          language,
        },
      }),
      secondaryHero: context.storefront.query<{hero: CollectionHero}>(
        COLLECTION_HERO_QUERY,
        {
          variables: {
            handle: 'backcountry',
            country,
            language,
          },
        },
      ),
      featuredCollections: context.storefront.query<{
        collections: CollectionConnection;
      }>(FEATURED_COLLECTIONS_QUERY, {
        variables: {
          country,
          language,
        },
      }),
      tertiaryHero: context.storefront.query<{hero: CollectionHero}>(
        COLLECTION_HERO_QUERY,
        {
          variables: {
            handle: 'winter-2022',
            country,
            language,
          },
        },
      ),
      analytics: {
        pageType: AnalyticsPageType.home,
      },
      seo,
    },
    {
      headers: {
        'Cache-Control': CACHE_SHORT,
      },
    },
  );
}

export default function Homepage() {
  const {
    primaryHero,
    secondaryHero,
    tertiaryHero,
    featuredCollections,
    featuredProducts,
  } = useLoaderData<typeof loader>();

  // TODO: skeletons vs placeholders
  const skeletons = getHeroPlaceholder([{}, {}, {}]);

  return (
    <>
      {primaryHero && (
        <Hero {...primaryHero} height="full" top loading="eager" />
      )}

      <Section
        display="grid"
        padding="all"
        className="grid-cols-2 content-center my-16"
      >
        <article className="flex flex-col justify-center items-start relative">
          <p className="mb-8 max-w-prose-narrow">
            Simple, planet-friendly underwear with highest quality and comfort.
            We focus on design and material over color and branding.
          </p>
          <Button className="flex">
            Shop
            <img
              className="pl-3"
              src={ButtonEyeClosedIcon}
              alt="button eye closed"
            />
          </Button>
        </article>
        <span className="relative">
          <img
            className="absolute bottom-0 -left-10"
            src={FlowerImg}
            alt="flowers"
          />
          <img
            className="ml-auto h-[85vh] w-auto"
            src={PlaceholderImg}
            alt="underwear in bathroom"
          />
        </span>
      </Section>

      <Section display="flex" padding="all" className="content-center my-16">
        <img
          className="h-[65vh] w-auto"
          src={PlaceholderImg}
          alt="underwear in bathroom"
        />
        <article className="flex flex-col justify-center items-start relative ml-24">
          <h2 className="text-xl pb-6">One style, one color</h2>
          <p className="mb-8 text-md max-w-prose">
            Our first style is the Boxer Short made for comfort and everyday
            use. A loose fit designed by expert pattern-makers in Sweden & New
            York. Perfected through multiple rounds of testing and feedback.
          </p>
          <Button className="flex">
            Shop
            <img
              className="pl-3"
              src={ButtonEyeClosedIcon}
              alt="button eye closed"
            />
          </Button>
        </article>
      </Section>

      <Section display="flex" padding="all" className="content-center my-16">
        <article className="flex flex-col justify-center items-start relative ml-24">
          <h2 className="text-xl pb-6">Thoughtful Comfort</h2>
          <p className="mb-8 text-md max-w-prose">
            Obsession over materials led us to believe we found the perfect
            balance of comfort, quality and sustainability.
          </p>
        </article>
        <img
          className="h-[65vh] w-auto ml-auto"
          src={PlaceholderImg}
          alt="underwear in bathroom"
        />
      </Section>

      <Section
        display="flex"
        padding="all"
        className="content-center justify-center items-center my-16"
      >
        <img src={TreeImg} alt="underwear in bathroom" />
        <article className="flex flex-col justify-center items-start relative ml-24">
          <h2 className="text-xl pb-6">Lenzing Tencel™</h2>
          <p className="mb-8 text-md max-w-prose">
            Our underwear are made from 95% Lenzing Tencel™. This is a
            plant-based biodegradable fabric that uses 90% less water to produce
            than cotton. It&apos;s wood is sourced from sustainably managed
            forests, ensuring responsible forestry practices.
          </p>
          <a href="/">Learn about our sustainability actions.</a>
        </article>
      </Section>

      <Section
        display="flex"
        padding="all"
        className="content-center justify-center items-center my-16 text-center flex-col"
      >
        <p className="text-sm max-w-prose font-mono">
          &quot;finally underwear that are just good looking&quot; - happy
          girlfriend
        </p>
        <a href="/">View all reviews</a>
      </Section>

      <Section
        display="flex"
        padding="all"
        className="content-center justify-center my-16 flex-col"
      >
        <h2 className="text-4xl">Meet our Boxer Shorts</h2>
        <p className="max-w-prose">
          Our first style (more are coming!). Designed to be the perfect
          lounger, expect a relaxed fit and comfort all day. Comes in black, so
          you only worry about size. Made with Lenzing Tencel, making them one
          of the most sustainable underwear on the market.
        </p>
      </Section>

      {featuredProducts && (
        <Suspense>
          <Await resolve={featuredProducts}>
            {({products}) => {
              if (!products?.nodes) return <></>;
              return (
                <ProductSwimlane products={products.nodes} title="" count={4} />
              );
            }}
          </Await>
        </Suspense>
      )}

      {secondaryHero && (
        <Suspense fallback={<Hero {...skeletons[1]} />}>
          <Await resolve={secondaryHero}>
            {({hero}) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )}

      {featuredCollections && (
        <Suspense>
          <Await resolve={featuredCollections}>
            {({collections}) => {
              if (!collections?.nodes) return <></>;
              return (
                <FeaturedCollections
                  collections={collections.nodes}
                  title="Collections"
                />
              );
            }}
          </Await>
        </Suspense>
      )}

      {tertiaryHero && (
        <Suspense fallback={<Hero {...skeletons[2]} />}>
          <Await resolve={tertiaryHero}>
            {({hero}) => {
              if (!hero) return <></>;
              return <Hero {...hero} />;
            }}
          </Await>
        </Suspense>
      )}
    </>
  );
}

const COLLECTION_CONTENT_FRAGMENT = `#graphql
  ${MEDIA_FRAGMENT}
  fragment CollectionContent on Collection {
    id
    handle
    title
    descriptionHtml
    heading: metafield(namespace: "hero", key: "title") {
      value
    }
    byline: metafield(namespace: "hero", key: "byline") {
      value
    }
    cta: metafield(namespace: "hero", key: "cta") {
      value
    }
    spread: metafield(namespace: "hero", key: "spread") {
      reference {
        ...Media
      }
    }
    spreadSecondary: metafield(namespace: "hero", key: "spread_secondary") {
      reference {
        ...Media
      }
    }
  }
`;

const HOMEPAGE_SEO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
    shop {
      name
      description
    }
  }
`;

const COLLECTION_HERO_QUERY = `#graphql
  ${COLLECTION_CONTENT_FRAGMENT}
  query collectionContent($handle: String, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    hero: collection(handle: $handle) {
      ...CollectionContent
    }
  }
`;

// @see: https://shopify.dev/api/storefront/2023-04/queries/products
export const HOMEPAGE_FEATURED_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query homepageFeaturedProducts($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    products(first: 3) {
      nodes {
        ...ProductCard
      }
    }
  }
`;

// @see: https://shopify.dev/api/storefront/2023-04/queries/collections
export const FEATURED_COLLECTIONS_QUERY = `#graphql
  query homepageFeaturedCollections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(
      first: 4,
      sortKey: UPDATED_AT
    ) {
      nodes {
        id
        title
        handle
        image {
          altText
          width
          height
          url
        }
      }
    }
  }
`;
