import { useEffect, useState } from "react";

import { AnimatePresence } from "framer-motion";
import { CSSTransition } from "react-transition-group";
import { useDispatch, useSelector } from "react-redux/es/exports";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { cartActions } from "./store/cart-slice";
import { authActions } from "./store/auth-slice";

import Cart from "./components/cart";
import Auth from "./components/auth";
import Navbar from "./components/navbar";
import Error404 from "./components/error404";
import HomeLayout from "./components/homeLayout";
import AnimatedPage from "./components/animatedPage";
import ProductsLayout from "./components/productsLayout";

import "./styles/App.css";

function App() {
  const location = useLocation();

  const dispatch = useDispatch();

  const showCarthandler = () => dispatch(cartActions.showCart());

  const user = useSelector((state) => state.auth.user);
  const showCart = useSelector((state) => state.cart.showCart);
  const itemsList = useSelector((state) => state.cart.itemsList);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    // this block run at first render to push user data stored into database using
    // email which stored in localStorge, have to be mentioned that this block run just once
    const fetchData = async () => {
      const loggedInUserEmail = JSON.parse(
        localStorage.getItem("jordan-shop-user")
      ).email;

      // It's Not only unsafe to fetch users data including passwords, but also unprofessional, but It's
      // completly ok duo to it's not real product.
      const allUsers = await fetch(
        "https://vito-shopping-app-default-rtdb.asia-southeast1.firebasedatabase.app/users.json"
      );

      var usersList = await allUsers.json();

      const localUsersList = usersList ? usersList : [];

      const existingUser = localUsersList.find(
        (item) => item.email === loggedInUserEmail
      );

      if (!existingUser) return;

      dispatch(authActions.Login(existingUser));

      dispatch(
        cartActions.setItemsList(
          existingUser.cartItemsList ? existingUser.cartItemsList : []
        )
      );
    };
    fetchData();
  }, []);

  useEffect(() => {
    const updateUserCart = async () => {
      const allUsers = await fetch(
        "https://vito-shopping-app-default-rtdb.asia-southeast1.firebasedatabase.app/users.json"
      );
      var usersList = await allUsers.json();

      // next line is because of firebase don't return empty array of users return null
      // which is useless and cause bug
      const localUsersList = usersList ? usersList : [];

      localUsersList.forEach((item) => {
        if (item.email === user.email) {
          item.cartItemsList = itemsList;
          return item;
        } else {
          return item;
        }
      });

      await fetch(
        "https://vito-shopping-app-default-rtdb.asia-southeast1.firebasedatabase.app/users.json",
        {
          method: "PUT",
          body: JSON.stringify(localUsersList),
        }
      );
    };
    updateUserCart();
  }, [itemsList, user.email]);

  const routes = [
    { path: "/", component: <HomeLayout /> },
    { path: "/products", component: <ProductsLayout /> },
    { path: "/man", component: <ProductsLayout /> },
    { path: "/woman", component: <ProductsLayout /> },
    { path: "/kids", component: <ProductsLayout /> },
  ];

  return (
    <>
      {isLoggedIn ? (
        <AnimatedPage>
          <Navbar />

          <CSSTransition
            in={showCart}
            timeout={300}
            classNames="cart"
            unmountOnExit
          >
            <Cart />
          </CSSTransition>
          {showCart && (
            <div className="close-section" onClick={showCarthandler}></div>
          )}

          <AnimatePresence exitBeforeEnter>
            <Routes key={location.pathname} location={location}>
              {routes.map((route) => (
                <Route exact path={route.path} element={route.component} />
              ))}
              <Route path="*" element={<Error404 />} />
            </Routes>
          </AnimatePresence>
        </AnimatedPage>
      ) : (
        <AnimatedPage>
          <AnimatePresence exitBeforeEnter>
            <Routes key={location.pathname} location={location}>
              <Route path="/" element={<Auth />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </AnimatedPage>
      )}
    </>
  );
}

export default App;
