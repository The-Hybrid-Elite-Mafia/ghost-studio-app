import document from '../../studio/rack-reference.html?raw';
import { getChatGPTUser, chatGPTSignInPath } from '../chatgpt-auth';

export const dynamic = 'force-dynamic';
export async function GET() {
  if (!await getChatGPTUser()) return new Response(null, {status:302,headers:{Location:chatGPTSignInPath('/rack'),'Cache-Control':'no-store'}});
  return new Response(document, {headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}});
}
