import { useEffect } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router';
import { SignInPage } from './features/auth/SignInPage';
import { GuidancePage } from './features/guidance/GuidancePage';
import { RehomePage } from './features/guidance/RehomePage';
import { ReviewPage } from './features/guidance/ReviewPage';
import { CompatPage } from './features/habitat/CompatPage';
import { HabitatPage } from './features/habitat/HabitatPage';
import { MyRequestsPage } from './features/habitat/MyRequestsPage';
import { RequestPage } from './features/habitat/RequestPage';
import { RequestSentPage } from './features/habitat/RequestSentPage';
import { HomePage } from './features/home/HomePage';
import { AccessibilityPage, ContactPage, HowItWorksPage, PrivacyPage } from './features/home/InfoPages';
import { BrowsePage } from './features/listings/BrowsePage';
import { EditorPage } from './features/listings/EditorPage';
import { IncomingPage } from './features/listings/IncomingPage';
import { ListingPage } from './features/listings/ListingPage';
import { MyListingsPage } from './features/listings/MyListingsPage';
import { DemosPage, DesignPage, MapPage } from './reference/ReferencePages';
import { TourPanel } from './reference/tour';
import { ROUTES, routeName } from './routes';
import { Layout } from './shared/Layout';
import { RequireAuth } from './shared/RequireAuth';
import { page } from './shared/styles';

const guard = (name, el) => <RequireAuth name={name}>{el}</RequireAuth>;

/** Old prototype links used #demos, #map … — send them to the matching page. */
const LEGACY = ['demos', 'map', 'design', 'browse', 'rehome'];

function NotFound() {
  return (
    <div className={page}>
      <h1 className="mb-4">Page not found</h1>
      <div className="grid max-w-[60ch] gap-4">
        <p>If you typed the web address, check it is correct. If you pasted it, check you copied the whole address.</p>
        <p>
          You can <Link to="/browse">browse listings</Link>, <Link to="/rehome">start rehoming</Link> or go to the{' '}
          <Link to="/">homepage</Link>.
        </p>
      </div>
    </div>
  );
}

export function App() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const h = location.hash.slice(1);
    if (location.pathname === '/' && LEGACY.includes(h)) navigate(ROUTES[h].path, { replace: true });
  }, [location.pathname, location.hash, navigate]);

  useEffect(() => {
    document.title = `${ROUTES[routeName(location.pathname)].title} · AquaBridge`;
  }, [location.pathname]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/browse" element={<BrowsePage />} />
        <Route path="/listings/new" element={guard('editor', <EditorPage />)} />
        <Route path="/listings/:id/edit" element={guard('editor', <EditorPage />)} />
        <Route path="/listings/:id" element={<ListingPage />} />
        <Route path="/rehome" element={<RehomePage />} />
        <Route path="/rehome/review" element={<ReviewPage />} />
        <Route path="/rehome/guidance" element={<GuidancePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/account/listings" element={guard('mylistings', <MyListingsPage />)} />
        <Route path="/account/incoming" element={guard('incoming', <IncomingPage />)} />
        <Route path="/account/habitat" element={guard('habitat', <HabitatPage />)} />
        <Route path="/account/habitat/:edit" element={guard('habitat', <HabitatPage />)} />
        <Route path="/check/:id" element={guard('compat', <CompatPage />)} />
        <Route path="/request/:id/:hab" element={guard('request', <RequestPage />)} />
        <Route path="/account/requests" element={guard('myrequests', <MyRequestsPage />)} />
        <Route path="/account/requests/sent/:id" element={guard('sent', <RequestSentPage />)} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/demos" element={<DemosPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/design" element={<DesignPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <TourPanel />
    </Layout>
  );
}
