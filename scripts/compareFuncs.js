
export function compareCanditateIndices( a, b ) {
  if ( a.index < b.index ){
    return -1;
  }
  if ( a.index > b.index ){
    return 1;
  }
  return 0;
}
export function compareCandidates( a, b ) {
  if ( a.score > b.score ){
    return -1;
  }
  if ( a.score < b.score ){
    return 1;
  }
  return 0;
}
export function compareSimilitudes( a, b ) {
  if ( a.similitude > b.similitude ){
    return -1;
  }
  if ( a.similitude < b.similitude ){
    return 1;
  }
  return 0;
}
