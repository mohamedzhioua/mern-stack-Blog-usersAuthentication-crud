import { useDispatch } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { CustomButton, CustomInput, Card, FormLoader } from "../index";
import { updateCoverPhoto } from "../../app/features/auth/authSlice";
import getCroppedImg from "../../utils/getCroppedImg";
import "./index.css";
import { MdPublic } from "react-icons/md";
import { BsCameraFill } from "react-icons/bs";
import { toast } from "react-toastify";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";

function ProfileCover({ isVisitor, user }) {
  const dispatch = useDispatch();

  const [image, setImage] = useState(null);
  const [showCoverMneu, setShowCoverMenu] = useState(false);
  const [showOldCover, setShowOldCover] = useState(false);
  const refInput = useRef(null);
  const CoverMenuRef = useRef();
  const coverRef = useRef(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [error, setError] = useState(null);
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();

  useEffect(() => {
    setWidth(coverRef.current.clientWidth);
    setHeight(coverRef.current.clientHeight);
  }, [window.innerWidth]);

  useEffect(() => {
    if (error) {
      toast.error(error, {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }, [error]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = useCallback(
    async (show) => {
      try {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        if (show) {
          setZoom(1);
          setCrop({ x: 0, y: 0 });
          console.log("donee", { croppedImage });
          setImage(croppedImage);
        } else {
          return croppedImage;
        }
      } catch (error) {
        console.error(error);
      }
    },
    [croppedAreaPixels]
  );

  //onChangefile
  const handleImage = (e) => {
    let file = e.target.files[0];
    if (
      file.type !== "image/jpeg" &&
      file.type !== "image/png" &&
      file.type !== "image/webp" &&
      file.type !== "image/jpg"
    ) {
      setError(`${file.name} format is not supported.`);
      return;
    } else if (file.size > 1024 * 1024 * 5) {
      setError(`${file.name} is too large max 5mb allowed.`);
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      setImage(event.target.result);
    };
  };
  const updateCover =  (form) => {
    return   axios.post("/user/update/profile/cover", form,{ headers: {
      "Content-Type": "multipart/form-data",
    }});
  };

  const { data, isLoading, isSuccess, mutate } = useMutation({
    mutationFn: updateCover,
  });
  useEffect(()=>{
    if ( isSuccess&& data) {
      coverRef.current.style.backgroundImage = `url(${data.data.cover})`;
      dispatch(updateCoverPhoto(data.data.cover));
      console.log("🚀 ~ file: ProfileCover.js:102 ~ useEffect ~ data.data:", data.data.cover)
      setTimeout(() => {
        setImage(null);
      }, 200);
    }
  },[isSuccess , data])

  const updateCoverHandler = async () => {
    try {
      let img = await getCroppedImage(false);
      let blob = await fetch(img).then((r) => r.blob());
      let form = new FormData();
      form.append("image", blob);
      mutate(form);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div
      className="profile-cover"
      ref={coverRef}
      style={{
        backgroundImage: `url(${user?.cover})`,
      }}
    >
      {image && (
        <>
          <div className="save-cover">
            <div className="left">
              <MdPublic
                style={{
                  width: "16px",
                  height: "16px",
                }}
              />
              Your cover is public
            </div>
            <div className="cover-btns">
              <CustomButton
                className="gray_btn cover"
                onClick={() => setImage(null)}
                value="Cancel"
              />

              <CustomButton
                className="blue_btn cover"
                value="Save"
                onClick={updateCoverHandler}
              />
            </div>
          </div>
          <FormLoader loading={isLoading} type={2}>
          <div className="cover_cropper">
            <Cropper
              classes={{
                mediaClassName: "mediaClassName",
              }}
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={width / height}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              showGrid={true}
              objectFit="horizontal-cover"
            />
          </div>
          </FormLoader>
        </>
      )}
      {isVisitor && (
        <>
          <div className="edit-cover-container">
            <CustomInput
              type="file"
              innerRef={refInput}
              hidden
              onChange={handleImage}
              accept="image/jpeg,image/png,image/webp,image/gif"
            />
            <div
              className="edit-cover"
              onClick={() => setShowCoverMenu((prev) => !prev)}
            >
              <BsCameraFill />
              <span>Add Cover Photo</span>
            </div>
            {showCoverMneu && (
              <Card className="cover_upload_menu" innerRef={CoverMenuRef}>
                <div
                  className="open_cover_menu_item hover1"
                  onClick={() => setShowOldCover(true)}
                >
                  <i className="photo_icon"></i>
                  Select Photo
                </div>
                <div
                  className="open_cover_menu_item hover1"
                  onClick={() => refInput.current.click()}
                >
                  <i className="upload_icon"></i>
                  Upload Photo
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ProfileCover;
