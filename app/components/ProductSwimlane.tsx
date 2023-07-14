import type {Product} from '@shopify/hydrogen/storefront-api-types';
import {ProductCard, Section} from '~/components';

const mockProducts = new Array(12).fill('');

export function ProductSwimlane({
  title = 'Featured Products',
  products = mockProducts,
  count = 12,
  ...props
}: {
  title?: string;
  products?: Product[];
  count?: number;
}) {
  return (
    <Section heading={title} padding="all" {...props}>
      <h2 className="text-4xl">Meet our Boxer Shorts</h2>
      <p className="max-w-prose">
        Our first style (more are coming!). Designed to be the perfect lounger,
        expect a relaxed fit and comfort all day. Comes in black, so you only
        worry about size. Made with Lenzing Tencel, making them one of the most
        sustainable underwear on the market.
      </p>
      <img
        className="max-h-[500px] w-full object-cover"
        src="https://placehold.co/2000x500"
        alt="placeholder img"
      />
      <div className="swimlane hiddenScroll md:pb-8 md:scroll-px-8 lg:scroll-px-12 grid-cols-3">
        {products.map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            className="snap-start"
          />
        ))}
      </div>
    </Section>
  );
}
