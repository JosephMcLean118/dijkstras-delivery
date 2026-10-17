function App() {
  return (
    <>
      <div className="header" style={{ margin: "10px" }}>
        <div className="card text-bg-white rounded-0 p-0">
          <div className="card-body py-2 px-3">
            <h1 className="text-black fs-4 m-0 float-start">Dijkstra's Delivery Service</h1>
          </div>
        </div>
      </div>

      <div className='body'>
        <div className="card" style={{ width: "18rem" }}>
          <img src="https://picsum.photos/400/200" class="card-img-top" alt="..." />
          <div className="card-body">
            <h5 className="card-title">Card title</h5>
            <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card’s content.</p>
            <a href="#" className="btn btn-primary">Go somewhere</a>
          </div>
        </div>
      </div>
    </>
  )
}

export default App