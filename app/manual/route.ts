import document from '../../studio/manual.html?raw';
export function GET() {
  return new Response(document, {headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});
}
