import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';

const NavbarWrapper = () => {
    const location = useLocation();
    const hideNavbarRoutes = ['/login', '/register', '/mfa-verify', '/check-email', '/verify-email'];

    if (hideNavbarRoutes.includes(location.pathname)) {
        return null;
    }

    return <Navbar />;
};

export default NavbarWrapper;
