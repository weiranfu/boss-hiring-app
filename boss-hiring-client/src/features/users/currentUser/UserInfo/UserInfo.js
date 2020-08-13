import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import Cookies from "js-cookie";
import { selectCurrentUser, logout } from "../currentUserSlice";
import { Result, List, Button, Modal } from "antd-mobile";
import "./UserInfo.less";

function UserInfo() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const history = useHistory();
  const alert = Modal.alert;
  const myImg = (src) => <img src={src} className="user-avatar" alt="" />;

  const header = user.type === "recruiter" ? "Job Offered" : "Job Expected";

  const onButtonClick = () => {
    const alertInstance = alert("Log Out", "Are you sure?", [
      {
        text: "Cancel",
        style: "default",
      },
      {
        text: "OK",
        onPress: () => {
          dispatch(logout()); // clear current user in redux
          history.push("/login");
          Cookies.remove("userId"); // clear cookie
        },
      },
    ]);
    setTimeout(() => {
      // 可以调用close方法以在外部close
      console.log("auto close");
      alertInstance.close();
    }, 500000);
  };

  return (
    <div className="user-info">
      <Result
        img={myImg(user.avatar)}
        title={user.username}
        message={user.company}
      />
      <List renderHeader={() => header}>
        <List.Item multipleLine>
          {user.title ? (
            <List.Item.Brief>Title: {user.title}</List.Item.Brief>
          ) : null}
          {user.salary ? (
            <List.Item.Brief>Salary: {user.salary}</List.Item.Brief>
          ) : null}
          <List.Item.Brief>Info: {user.info}</List.Item.Brief>
        </List.Item>
      </List>
      <Button type="warning" onClick={onButtonClick}>
        Log Out
      </Button>
    </div>
  );
}

export default UserInfo;