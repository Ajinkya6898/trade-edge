import "../index.css";

const Loader = () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 flex items-center justify-center">
        <div className="loader"></div>
      </div>
    </>
  );
};

export default Loader;
