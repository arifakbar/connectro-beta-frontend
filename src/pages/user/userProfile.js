import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import Resizer from "react-image-file-resizer";
import axios from "axios";

import { getUserPosts, deletePost } from "../../functions/posts";
import { currentUserProfile, changeUserProfilePic } from "../../functions/user";

function UserProfile(props) {
  const [posts, setPosts] = useState("");
  const [currentUser, setCurrentUser] = useState({});
  const check =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";

  const { user } = props;

  useEffect(() => {
    loadUserPosts();
    loadUser();
  }, []);

  const loadUserPosts = async () => {
    try {
      const res = await getUserPosts(user._id);
      setPosts(res.data.data);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  const loadUser = async () => {
    try {
      const res = await currentUserProfile(user.token);
      setCurrentUser(res.data.data);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  const handleDelete = async (p) => {
    if (window.confirm(`Do you really want to remove ${p.title} post?`)) {
      try {
        const res = await deletePost(user.token, p._id);
        if (res.data.ok) {
          toast.success(`${p.title} post deleted successfully.`);
          loadUserPosts();
        }
      } catch (err) {
        console.log(err);
        toast.error(err.message);
      }
    }
  };

  const ChangeProfilePic = async (e) => {
    let files = e.target.files;
    if (files) {
      try {
        Resizer.imageFileResizer(
          files[0],
          720,
          720,
          "jpeg",
          100,
          0,
          (uri) => {
            return axios
              .post(
                process.env.REACT_APP_API + "uploadImage",
                {
                  image: uri,
                },
                { headers: { authToken: user.token } }
              )
              .then(async (res) => {
                await changeUserProfilePic(user.token, res.data.data);
              })
              .then(() => {
                loadUser();
                toast.success("Profile Pic changed successfully.");
              });
          },
          "base64"
        );
      } catch (err) {
        console.log(err);
        toast.error(err.message);
      }
    }
  };

  const RemoveProfilePic = async (id) => {
    try {
      await axios.post(
        process.env.REACT_APP_API + "deleteImage",
        {
          public_id: id,
        },
        { headers: { authToken: user.token } }
      );
      await changeUserProfilePic(user.token, {});
      toast.success("Profile Pic removed successfully.");
      loadUser();
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  return (
    <div className="p-5 flex flex-col md:flex-row justify-around gap-10 md:h-screen2 md:overflow-hidden">
      <div className="md:w-2/5  flex items-center flex-col justify-center gap-5  md:h-screen2">
        <div className="rounded-full h-56 w-56 flex items-center justify-center overflow-hidden">
          <img
            src={currentUser.profilePic ? currentUser.profilePic.url : check}
            alt="NF"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex gap-2">
          <li className="relative w-28" style={{ listStyle: "none" }}>
            <input
              type="file"
              accept="images/* "
              className="opacity-0 cursor-pointer w-24"
              onChange={ChangeProfilePic}
            />
            <button
              className="border-2 p-2 shadow-md cursor-pointer absolute top-0 left-0"
              style={{ zIndex: -1 }}
            >
              Change Pic
            </button>
          </li>
          {!currentUser.profilePic ||
            (check !== currentUser.profilePic.url && (
              <button
                className="border-2 p-2 shadow-md "
                onClick={() =>
                  RemoveProfilePic(currentUser.profilePic.public_id)
                }
              >
                Remove Pic
              </button>
            ))}
        </div>
        <p className="text-xl font-semibold">
          {props.user.username.toUpperCase()}
        </p>
        <p>{posts.length} Posts</p>
        <div className="flex gap-5">
          <Link to={`/user/follower/${user._id}`}>
            <p className="border-2 p-2 shadow-md ">
              {currentUser.followers && currentUser.followers.length} Follower's
            </p>
          </Link>
          <Link to={`/user/following/${user._id}`}>
            <p className="border-2 p-2 shadow-md ">
              {currentUser.following && currentUser.following.length} Following
            </p>
          </Link>
        </div>
      </div>
      <div className="md:w-3/5  flex flex-col  pt-2 gap-5 md:h-screen ">
        <div>
          <Link
            className="border-2 p-2 shadow-md rounded md:float-right"
            to="/createPost"
          >
            Add New Post
          </Link>
        </div>
        <hr />
        <p className="text-center text-xl font-semibold ">User Posts</p>
        <div className="flex w-full pt-2 pb-36 shadow-md flex-wrap justify-center gap-5 md:overflow-auto">
          {posts.length > 0
            ? posts.map((p) => {
                return (
                  <div key={p._id} className="md:w-1/4 h-48">
                    <div className=" h-44 overflow-hidden">
                      <img
                        src={p.image}
                        alt="NF"
                        className="w-full h-full object-fill"
                      />
                    </div>
                    <h3 style={{ fontFamily: "Roboto" }}>{p.title}</h3>
                    <button
                      className="w-full my-2 p-1 bg-red-500 text-white shadow-xl cursor-pointer"
                      onClick={() => handleDelete(p)}
                    >
                      Remove
                    </button>
                  </div>
                );
              })
            : "No Posts Yet"}
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return { user: state.auth };
};

export default connect(mapStateToProps)(UserProfile);
