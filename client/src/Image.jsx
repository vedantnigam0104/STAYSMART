export default function Image({src, ...rest}) {
  // Check if src is not empty and does not already include 'http' or 'uploads'
  if (src && !src.includes('http') && !src.startsWith('uploads/')) {
    src = 'http://localhost:4000/uploads/' + src;
  }
  else
  {
    src = 'http://localhost:4000/' + src;
  }

  //console.log('Image source:', 'http://localhost:4000/' + src); // Debugging line

  return (
    <img {...rest} src={src} alt={'Image not available'} />
  );
}
