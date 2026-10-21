import { useState, type SubmitEvent } from 'react'

type UploadedImage = { path: string; url: string }

export default function App() {
  const [sku, setSku] = useState('LEV-1001')
  const [file, setFile] = useState<File | null>(null)
  const [image, setImage] = useState<UploadedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function upload(e: SubmitEvent) {
    e.preventDefault()
    if (!file) return

    // Files are sent as multipart/form-data – not JSON. FormData builds it for us.
    const form = new FormData()
    form.append('image', file)
    try {
      const response = await fetch(`/api/admin/products/${sku}/image`, {
        method: 'POST',
        body: form,
      })
      const data = await response.json()
      setImage(data)
    } catch(err) {
      console.log(err)
    }
  }

  async function remove() {
    if (!image) return
    try {
      // The walkthrough has no database, so the path is sent in the request.
      // In your shop: DON'T send the path – call DELETE /api/admin/products/${sku}/image and let the
      // server fetch the product by sku from the DB and take its image_path from there.
      await fetch(`/api/admin/products/${sku}/image?path=${image.path}`, { 
        method: 'DELETE' 
      })
      
      setImage(null)
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <main>
      <h1>Product image</h1>

      <form onSubmit={upload}>
        <label>
          Sku <input type="text" value={sku} onChange={(e) => setSku(e.target.value)}/>
        </label>
        <label>
          Image
          {/* accept only image/jpeg,image/png. NOTE the SERVER still has to check the file */}
          <input type="file" name="image" accept="image/png, image/jpeg" onChange={(e) => {
              console.log(e.target.files?.[0] ?? null)
              setFile(e.target.files?.[0] ?? null)
            }
          } />
        </label>
        <button>Upload</button>
      </form>

      {error && <p role="alert">{error}</p>}

      {image && (
        <section>
          {/* The browser loads the image straight from Supabase's CDN – not through our server */}
          <img src={image.url} alt={`Product ${sku}`} width={300} />
          <p>
            <a href={image.url}>{image.url}</a>
          </p>
          <button onClick={remove}>Delete the image</button>
        </section>
      )}
    </main>
  )
}
