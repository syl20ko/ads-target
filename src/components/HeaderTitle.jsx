
import React from "react";

function HeaderTitle() {
  return (
    <div className="container mt-3">
      <div className="row align-items-center">
        <div className="col-6">
          <img
            src="/ads-taget/logo-sylvain-caron.png"
            className="logoSylvain"
            alt="Sylvain Caron"
          />
        </div>
        <div className="col-6 d-flex justify-content-end">
          <h1 className="title" style={{margin : "0px"}}>
            <span style={{ color: "#4C86F9", fontWeight: "bold" }}>A</span>
            <span style={{ color: "#49A84C", fontWeight: "bold" }}>d</span>
            <span style={{ color: "#F6BB02", fontWeight: "bold" }}>s</span>
            <span style={{ color: "#E1432E", fontWeight: "bold" }}>.</span>
            <span style={{ color: "black" }}> Target</span>
          </h1>
        </div>
      </div>
    </div>
  );
}

export default HeaderTitle;
