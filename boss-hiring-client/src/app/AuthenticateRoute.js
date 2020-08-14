import React, { useEffect, useState } from "react";
import { Route, Redirect, useHistory } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  selectCurrentUser,
  fetchCurrentUser,
} from "../features/users/currentUser/currentUserSlice";
import { fetchUsers } from "../features/users/usersSlice";
import { Toast, ActivityIndicator } from "antd-mobile";
import Cookies from "js-cookie";
import registerWSClient from "../web/webSocket";

// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.
export default function AuthenticateRoute({ children, ...rest }) {
  const userId = Cookies.get("userId");
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const histroy = useHistory();
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (!userId) {
      Toast.fail("Your login cession has expired, please login again");
    }
    const fetchUser = async () => {
      console.log("Fetching current user...");
      const resultAction = await dispatch(fetchCurrentUser());
      if (fetchCurrentUser.fulfilled.match(resultAction)) {
        const newUser = unwrapResult(resultAction);
        async function getAllUsers() {
          console.log("Fetching all users...");
          const type = {
            type: newUser.type === "recruiter" ? "jobseeker" : "recruiter",
          };
          await dispatch(fetchUsers(type));
          setLoadingUsers(false);
        }
        getAllUsers();
        // if we fetch current logged in user, send its type to web socket Sever
        registerWSClient(newUser.type);
      } else {
        if (resultAction.payload) {
          Toast.fail(resultAction.payload.message, 1.5);
        } else {
          Toast.fail(resultAction.error.message, 1.5);
        }
        histroy.push("/login");
      }
    };
    // if we have userId in cookies but redux doesn't have current user
    if (userId && !user) {
      fetchUser(); // after fetching user, this component will re-render
    }
  }, [user, userId, dispatch, histroy]);

  // stop rendering and wait for async result !!!!!!!

  if (userId && !user) {
    console.log("Auth accetps but user doesn't exist in Redux");
    return <ActivityIndicator toast text="Loading..." animating={true} />;
  }

  // if users haven't been loaded, stop rendering and wait
  if (loadingUsers) {
    console.log("Waiting for users to be loaded");
    return <ActivityIndicator toast text="Loading..." animating={true} />;
  }

  return (
    <Route
      {...rest}
      render={({ location }) =>
        userId ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location },
            }}
          />
        )
      }
    />
  );
}
