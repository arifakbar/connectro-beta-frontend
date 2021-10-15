import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import { populatedUserById } from "../../functions/user";

function Following(props) {
  const { user } = props;
  const { userId } = props.match.params;
  const [otherUser, setOtherUser] = useState([]);

  useEffect(() => {
    loadOtherUser();
  }, []);

  const loadOtherUser = async () => {
    try {
      const res = await populatedUserById(userId);
      setOtherUser(res.data.data.following);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  return (
    <div className="px-3">
      <h1 className="text-center text-xl my-5">Followings</h1>
      <hr />
      <ul className="">
        {otherUser &&
          otherUser.map((f) => {
            return (
              <Link to={`/user/${f._id}`}>
                <li className="border-2 p-2 m-2" key={f._id}>
                  {f.username}
                </li>
              </Link>
            );
          })}
      </ul>
    </div>
  );
}

const mapStateToProps = (state) => {
  return { user: state.auth };
};

export default connect(mapStateToProps)(Following);
