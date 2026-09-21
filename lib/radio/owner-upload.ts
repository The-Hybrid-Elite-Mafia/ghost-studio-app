import {bucket,db,defaults} from './station';
export type UploadInfo={title:string;artist:string;genre:string;name:string;audioSize:number;coverSize:number;rights:boolean;restore?:{id:string;status:"approved"|"pending"|"rejected";uploader:string;created:number}};
const CHUNK=256*1024;
export async function validateInfo(v:UploadInfo){
 if(!v||typeof v.title!=="string"||!v.title.trim()||v.title.length>120||typeof v.artist!=="string"||!v.artist.trim()||v.artist.length>100)throw Error("Enter a song title and artist");
 if(typeof v.genre!=="string"||(!defaults.includes(v.genre)&&!await db().prepare("SELECT name FROM genres WHERE name=?").bind(v.genre).first()))throw Error("Choose an available genre");
 if(typeof v.name!=="string"||!(/\.(mp3|wav|mp4)$/i).test(v.name))throw Error("Choose MP3, WAV, or MP4");
 if(!Number.isInteger(v.audioSize)||v.audioSize<12||v.audioSize>100*1024*1024||!Number.isInteger(v.coverSize)||v.coverSize<0||v.coverSize>20*1024*1024)throw Error("Media must be under 100 MB and cover art under 20 MB");
 if(v.restore){const r=v.restore;if(!/^[a-zA-Z0-9_-]{1,100}$/.test(r.id)||!['approved','pending','rejected'].includes(r.status)||typeof r.uploader!=='string'||!r.uploader||r.uploader.length>200||!Number.isSafeInteger(r.created)||r.created<0)throw Error('Invalid original track metadata');}
 if(v.rights!==true)throw Error("Confirm permission to share this media");
}
export async function readRange(id:string,start:number,end:number){const parts:ArrayBuffer[]=[];for(let i=Math.floor(start/CHUNK);i<Math.ceil(end/CHUNK);i++){const o=await bucket().get(`chunks/${id}/${i}`);if(!o)throw Error("An upload piece is missing. Please try again.");const bytes=await o.arrayBuffer();parts.push(bytes.slice(Math.max(0,start-i*CHUNK),Math.min(bytes.byteLength,end-i*CHUNK)));}const body=await new Blob(parts).arrayBuffer();if(body.byteLength!==end-start)throw Error("Upload incomplete. Please try again.");return body;}
export type CoverInfo={action:"cover";trackId:string;coverSize:number};
export async function validateCover(info:CoverInfo){if(!info||info.action!=="cover"||typeof info.trackId!=="string"||!Number.isInteger(info.coverSize)||info.coverSize<8||info.coverSize>20*1024*1024)throw Error("Choose JPG or PNG cover art up to 20 MB");if(!await db().prepare("SELECT id FROM tracks WHERE id=? AND status!='uploading'").bind(info.trackId).first())throw Error("Track not found");}
