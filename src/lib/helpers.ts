import path from "path";

export function assetPath(p: string) {
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, '..', '..', 'public', p);
  } else {
    return path.join(__dirname, '..', '..', p); 
  }
};