import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { register, selectLoadingStatus } from "./authSlice";
import { wsClient } from "../../App";
import { fetchUsers } from "./usersSlice";
import {
  NavBar,
  WingBlank,
  List,
  InputItem,
  Button,
  Flex,
  Toast,
} from "antd-mobile";
import Logo from "../../app/logo/logo";

const ListItem = List.Item;
const FlexItem = Flex.Item;

function Register() {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [type, setType] = useState("employer");
  const [typeStyle1, setTypeStyle1] = useState("primary");
  const [typeStyle2, setTypeStyle2] = useState("");

  let history = useHistory(); // use history hooks
  const dispatch = useDispatch();

  const loadingStatus = useSelector(selectLoadingStatus);

  const onUsernameChange = (val) => setUserName(val);
  const onPasswordChange = (val) => setPassword(val);

  const onTypeStyleClick1 = () => {
    setType("employer");
    if (typeStyle1 !== "primary") {
      setTypeStyle1("primary");
      setTypeStyle2("");
    }
  };
  const onTypeStyleClick2 = () => {
    setType("employee");
    if (typeStyle2 !== "primary") {
      setTypeStyle2("primary");
      setTypeStyle1("");
    }
  };

  const canLogin =
    [username, password].every(Boolean) && loadingStatus === "idle";

  const onRegisterClick = async () => {
    // since we use rejectWithValue, we don't need to unwarp the result
    const resultAction = await dispatch(register({ username, password, type }));
    if (register.fulfilled.match(resultAction)) {
      // succeed
      const user = unwrapResult(resultAction);
      const type = { type: user.type === "employer" ? "employee" : "employer" };
      await dispatch(fetchUsers(type)); // fetch all users when login
      wsClient.send(JSON.stringify({ type: user.type })); // build TCP connection between client and server for users list updated
      history.push("/");
    } else {
      if (resultAction.payload) {
        Toast.fail(resultAction.payload.message, 1.5);
      } else {
        Toast.fail(resultAction.error.message, 1.5);
      }
    }
  };

  const toLoginClick = () => {
    history.push("/login");
  };

  return (
    <div>
      <NavBar>BOSS HIRING</NavBar>
      <Logo />
      <WingBlank size="lg">
        <List>
          <ListItem>
            <InputItem
              placeholder={"Please enter your user name"}
              onChange={onUsernameChange}
            >
              User Name
            </InputItem>
          </ListItem>
          <ListItem>
            <InputItem
              type="password"
              placeholder={"Please enter your password"}
              onChange={onPasswordChange}
            >
              Password
            </InputItem>
          </ListItem>

          <ListItem>
            <Flex>
              <FlexItem>
                <Button type={typeStyle1} onClick={onTypeStyleClick1}>
                  I'm an Employer
                </Button>
              </FlexItem>
              <FlexItem>
                <Button type={typeStyle2} onClick={onTypeStyleClick2}>
                  I'm a Job Seeker
                </Button>
              </FlexItem>
            </Flex>
          </ListItem>

          <ListItem>
            <Button
              type="primary"
              onClick={onRegisterClick}
              disabled={!canLogin}
            >
              Sign In
            </Button>
          </ListItem>
          <ListItem>
            <Button onClick={toLoginClick}>Already Has an Account</Button>
          </ListItem>
        </List>
      </WingBlank>
    </div>
  );
}

export default Register;