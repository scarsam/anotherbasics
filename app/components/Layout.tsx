import {
  type EnhancedMenu,
  type EnhancedMenuItem,
  useIsHomePath,
} from '~/lib/utils';
import {
  Drawer,
  useDrawer,
  Text,
  Input,
  IconLogin,
  IconAccount,
  IconBag,
  IconSearch,
  Heading,
  IconMenu,
  IconCaret,
  Section,
  CountrySelector,
  Cart,
  CartLoading,
  Link,
} from '~/components';
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  AnimatePresence,
} from 'framer-motion';

import {useParams, Form, Await, useMatches} from '@remix-run/react';
import {useWindowScroll} from 'react-use';
import {Disclosure} from '@headlessui/react';
import {Suspense, useEffect, useMemo, useRef, useState} from 'react';
import {useIsHydrated} from '~/hooks/useIsHydrated';
import {useCartFetchers} from '~/hooks/useCartFetchers';
import {useCurrentDate} from '~/hooks/useCurrentDate';
import type {LayoutData} from '../root';
import Logo from '../../public/anydays-logo.svg';
import Smile from '../../public/smile-icon.svg';
import Eye from '../../public/eye-nav.svg';

export function Layout({
  children,
  layout,
}: {
  children: React.ReactNode;
  layout: LayoutData;
}) {
  const [paddingTop, setPaddingTop] = useState(0);

  useEffect(() => {
    setPaddingTop(
      document.getElementById('header')?.getBoundingClientRect()?.height || 0,
    );
  }, []);

  return (
    <>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="">
          <a href="#mainContent" className="sr-only">
            Skip to content
          </a>
        </div>
        <Header
          title={layout?.shop.name ?? 'Hydrogen'}
          menu={layout?.headerMenu}
        />
        <main role="main" id="mainContent" className="flex-grow">
          {children}
        </main>
      </div>
      <Footer menu={layout?.footerMenu} />
    </>
  );
}

function Header({title, menu}: {title: string; menu?: EnhancedMenu}) {
  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers('ADD_TO_CART');

  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
  );
}

function CartDrawer({isOpen, onClose}: {isOpen: boolean; onClose: () => void}) {
  const [root] = useMatches();

  return (
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={root.data?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: EnhancedMenu;
}) {
  return (
    <Drawer open={isOpen} onClose={onClose} openFrom="left" heading="Menu">
      <div className="grid">
        <MenuMobileNav menu={menu} onClose={onClose} />
      </div>
    </Drawer>
  );
}

function MenuMobileNav({
  menu,
  onClose,
}: {
  menu: EnhancedMenu;
  onClose: () => void;
}) {
  return (
    <nav className="grid gap-4 p-6 sm:gap-6 sm:px-12 sm:py-8">
      {/* Top level menu items */}
      {(menu?.items || []).map((item) => (
        <span key={item.id} className="block">
          <Link
            to={item.to}
            target={item.target}
            onClick={onClose}
            className={({isActive}) =>
              isActive ? 'pb-1 border-b -mb-px' : 'pb-1'
            }
          >
            <Text as="span" size="copy">
              {item.title}
            </Text>
          </Link>
        </span>
      ))}
    </nav>
  );
}

function MobileHeader({
  title,
  isHome,
  openCart,
  openMenu,
}: {
  title: string;
  isHome: boolean;
  openCart: () => void;
  openMenu: () => void;
}) {
  // useHeaderStyleFix(containerStyle, setContainerStyle, isHome);

  const params = useParams();

  return (
    <header
      role="banner"
      className={`${
        isHome
          ? 'bg-primary/80 dark:bg-contrast/60 text-contrast dark:text-primary shadow-darkHeader'
          : 'bg-contrast/80 text-primary'
      } flex lg:hidden items-center h-nav sticky backdrop-blur-lg z-40 top-0 justify-center w-full leading-none gap-4 px-4 md:px-8`}
    >
      <div className="flex items-center justify-start w-full gap-4">
        <button
          onClick={openMenu}
          className="relative flex items-center justify-center w-8 h-8"
        >
          <IconMenu />
        </button>
        <Form
          method="get"
          action={params.lang ? `/${params.lang}/search` : '/search'}
          className="items-center gap-2 sm:flex"
        >
          <button
            type="submit"
            className="relative flex items-center justify-center w-8 h-8"
          >
            <IconSearch />
          </button>
          <Input
            className={
              isHome
                ? 'focus:border-contrast/20 dark:focus:border-primary/20'
                : 'focus:border-primary/20'
            }
            type="search"
            variant="minisearch"
            placeholder="Search"
            name="q"
          />
        </Form>
      </div>

      <Link
        className="flex items-center self-stretch leading-[3rem] md:leading-[4rem] justify-center flex-grow w-full h-full"
        to="/"
      >
        <Heading
          className="font-bold text-center leading-none"
          as={isHome ? 'h1' : 'h2'}
        >
          {title}
        </Heading>
      </Link>

      <div className="flex items-center justify-end w-full gap-4">
        <AccountLink className="relative flex items-center justify-center w-8 h-8" />
        <CartCount isHome={isHome} openCart={openCart} />
      </div>
    </header>
  );
}

const MarqueeContent = () => {
  return (
    <span className="flex justify-between items-center w-max">
      <p className="px-24 whitespace-nowrap">
        FREE SAME-DAY SHIPPING ON ALL ORDERS
      </p>
      <img
        className="animate-[spin_4s_linear_infinite] px-24"
        src={Smile}
        alt="banner-icon"
      />
      <p className="px-24 whitespace-nowrap">
        FREE SAME-DAY SHIPPING ON ALL ORDERS
      </p>
      <img
        className="animate-[spin_4s_linear_infinite] px-24"
        src={Smile}
        alt="banner-icon"
      />
      <p className="px-24 whitespace-nowrap">
        FREE SAME-DAY SHIPPING ON ALL ORDERS
      </p>
      <img
        className="animate-[spin_4s_linear_infinite] px-24"
        src={Smile}
        alt="banner-icon"
      />
      <p className="px-24 whitespace-nowrap">
        FREE SAME-DAY SHIPPING ON ALL ORDERS
      </p>
      <img
        className="animate-[spin_4s_linear_infinite] px-24"
        src={Smile}
        alt="banner-icon"
      />
    </span>
  );
};

function DesktopHeader({
  isHome,
  menu,
  openCart,
  title,
}: {
  isHome: boolean;
  openCart: () => void;
  menu?: EnhancedMenu;
  title: string;
}) {
  const params = useParams();
  const {currentDate} = useCurrentDate();
  const {scrollY, scrollYProgress} = useScroll();
  const width = useTransform(scrollY, [0, 100], ['90wv', '15vw']);
  const top = useTransform(scrollY, [0, 100], ['101%', '50%']);
  const transform = useTransform(scrollY, [0, 100], ['0', '-50%']);
  const backgroundBlur = useTransform(scrollYProgress, (v) =>
    v * 100 <= 7.5 ? `blur(${v * 100}px)` : `blur(7.5px)`,
  );
  const borderBottom = useTransform(scrollYProgress, (v) =>
    v * 100 <= 20 ? 0 : 1,
  );

  return (
    <>
      <div className="bg-[#E1C8FF] h-[40px] flex justify-between items-center sticky top-0 z-40 overflow-hidden">
        <div className="animate-marquee">
          <MarqueeContent />
        </div>
        <div className="animate-marquee2 absolute top-1/2 left-0">
          <MarqueeContent />
        </div>
      </div>
      <header
        id="header"
        role="banner"
        // style={{
        //   backdropFilter: backgroundBlur,
        //   borderBottomWidth: borderBottom,
        //   borderBottomColor: 'rgba(28, 7, 66, 0.2)',
        // }}
        className={`${isHome ? '' : 'bg-contrast/80 text-primary'} ${
          !isHome && 10 > 50 && ' shadow-lightHeader'
        } py-2 hidden lg:flex items-center flex-col transition duration-300 top-0 w-full leading-none`}
      >
        <img
          // style={{width}}
          src={Logo}
          className=" w-[95vw] pt-2 pb-4"
          alt="Anydays Logo"
        />
      </header>
      <Section
        as="nav"
        display="flex"
        padding="x"
        className="-bottom-5 justify-between items-center sticky top-[40px] m-auto z-40"
      >
        <img src={Eye} alt="eye icon" />

        {/* Top level menu items */}
        <div className="flex py-4">
          {(menu?.items || []).map((item) => (
            <Link
              key={item.id}
              to={item.to}
              target={item.target}
              prefetch="intent"
              className={({isActive}) =>
                isActive
                  ? 'pb-1 px-3 text-sm border-b -mb-px uppercase'
                  : 'pb-1 px-3 text-sm uppercase'
              }
            >
              {item.title}
            </Link>
          ))}
          <div className="pl-2">
            <CartCount isHome={isHome} openCart={openCart} />
          </div>
        </div>
      </Section>
    </>
  );
}

function AccountLink({className}: {className?: string}) {
  const [root] = useMatches();
  const isLoggedIn = root.data?.isLoggedIn;
  return isLoggedIn ? (
    <Link to="/account" className={className}>
      <IconAccount />
    </Link>
  ) : (
    <Link to="/account/login" className={className}>
      <IconLogin />
    </Link>
  );
}

function CartCount({
  isHome,
  openCart,
}: {
  isHome: boolean;
  openCart: () => void;
}) {
  const [root] = useMatches();

  return (
    <Suspense fallback={<Badge count={0} dark={isHome} openCart={openCart} />}>
      <Await resolve={root.data?.cart}>
        {(cart) => (
          <Badge
            dark={isHome}
            openCart={openCart}
            count={cart?.totalQuantity || 0}
          />
        )}
      </Await>
    </Suspense>
  );
}

function Badge({
  openCart,
  dark,
  count,
}: {
  count: number;
  dark: boolean;
  openCart: () => void;
}) {
  const isHydrated = useIsHydrated();

  const BadgeCounter = useMemo(
    () => <p className="text-sm">BAG {count || 0}</p>,
    [count],
  );

  return isHydrated ? (
    <button onClick={openCart} className="relative flex focus:ring-primary/5">
      {BadgeCounter}
    </button>
  ) : (
    <Link to="/cart" className="relative flex focus:ring-primary/5">
      {BadgeCounter}
    </Link>
  );
}

function Footer({menu}: {menu?: EnhancedMenu}) {
  const isHome = useIsHomePath();
  const itemsCount = menu
    ? menu?.items?.length + 1 > 4
      ? 4
      : menu?.items?.length + 1
    : [];

  return (
    <Section
      display="flex"
      // divider="top"
      padding="all"
      as="footer"
      role="contentinfo"
      // className={`grid min-h-[25rem] bg-white overflow-hidden border-top`}
    >
      <div className="border-black border-t w-full">
        <img
          // style={{width}}
          src={Logo}
          className=" w-[95vw] py-10"
          alt="Anydays Logo"
        />
        <FooterMenu menu={menu} />
        {/* <CountrySelector /> */}
        {/* <div
          className={`self-end pt-8 opacity-50 md:col-span-2 lg:col-span-${itemsCount}`}
        >
          &copy; {new Date().getFullYear()} / Shopify, Inc. Hydrogen is an MIT
          Licensed Open Source project.
        </div> */}
      </div>
    </Section>
  );
}

const FooterLink = ({item}: {item: EnhancedMenuItem}) => {
  if (item.to.startsWith('http')) {
    return (
      <a href={item.to} target={item.target} rel="noopener noreferrer">
        {item.title}
      </a>
    );
  }

  return (
    <Link to={item.to} target={item.target} prefetch="intent">
      {item.title}
    </Link>
  );
};

function FooterMenu({menu}: {menu?: EnhancedMenu}) {
  const styles = {
    section: 'grid gap-4',
    nav: 'grid gap-2 pb-6',
  };

  return (
    <div className="grid grid-cols-3 justify-between">
      <div className="flex-auto">
        {(menu?.items || []).map((item: EnhancedMenuItem) => (
          <section key={item.id} className={styles.section}>
            <Disclosure>
              {({open}) => (
                <>
                  <Disclosure.Button className="text-left md:cursor-default">
                    <Text
                      className="flex justify-between pb-2"
                      size="lead"
                      as="h3"
                    >
                      {item.title}
                      {item?.items?.length > 0 && (
                        <span className="md:hidden">
                          <IconCaret direction={open ? 'up' : 'down'} />
                        </span>
                      )}
                    </Text>
                  </Disclosure.Button>
                  {item?.items?.length > 0 ? (
                    <div
                      className={`${
                        open ? `max-h-48 h-fit` : `max-h-0 md:max-h-fit`
                      } overflow-hidden transition-all duration-300`}
                    >
                      <Suspense data-comment="This suspense fixes a hydration bug in Disclosure.Panel with static prop">
                        <Disclosure.Panel static>
                          <nav className={styles.nav}>
                            {item.items.map((subItem) => (
                              <FooterLink key={subItem.id} item={subItem} />
                            ))}
                          </nav>
                        </Disclosure.Panel>
                      </Suspense>
                    </div>
                  ) : null}
                </>
              )}
            </Disclosure>
          </section>
        ))}
      </div>
      <Text className="flex flex-1 justify-between pb-2" size="lead">
        Instagram+
      </Text>
      <label className="flex items-start flex-col">
        <Text className="flex justify-between pb-2" size="lead">
          Newsletter
        </Text>
        <span className="flex w-full">
          <input
            className="border-b border-black border-t-0 border-l-0 border-r-0 w-full focus:ring-0"
            type="text"
            placeholder="Enter your email"
          />
          <button className="bg-white border-b border-black border-t-0 border-l-0 border-r-0">
            Subscribe
          </button>
        </span>
      </label>
    </div>
  );
}
