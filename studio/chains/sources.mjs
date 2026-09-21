import fs from 'node:fs/promises';
import ts from 'typescript';
const wanted=new Set(['mj','mn','TA','va','Vv','GENRES','BEATS','VOCALS','PLUGINS','PRESETS','wl','ba','allData','Gv','Wv','hA','mA','pA','fA','gA','_v']);
// Read catalog literals without executing the embedded website or its dependencies.
export function literal(node){
 if(ts.isStringLiteral(node)||ts.isNoSubstitutionTemplateLiteral(node))return node.text;
 if(ts.isNumericLiteral(node))return Number(node.text);
 if(node.kind===ts.SyntaxKind.TrueKeyword)return true;if(node.kind===ts.SyntaxKind.FalseKeyword)return false;if(node.kind===ts.SyntaxKind.NullKeyword)return null;
 if(ts.isPrefixUnaryExpression(node)&&node.operator===ts.SyntaxKind.MinusToken)return -literal(node.operand);
 if(ts.isArrayLiteralExpression(node))return node.elements.map(literal);
 if(ts.isObjectLiteralExpression(node)){const result={};for(const property of node.properties){if(!ts.isPropertyAssignment(property))throw Error('Catalog has a nonliteral property.');const name=property.name;if(!ts.isIdentifier(name)&&!ts.isStringLiteral(name)&&!ts.isNumericLiteral(name))throw Error('Catalog has a computed key.');result[name.text]=literal(property.initializer);}return result;}
 throw Error('Catalog value must be literal: '+ts.SyntaxKind[node.kind]);
}
export function extractCatalogs(html){const found={};for(const match of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){const file=ts.createSourceFile('catalog.js',match[1],ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);function visit(node){if(ts.isVariableDeclaration(node)&&ts.isIdentifier(node.name)&&wanted.has(node.name.text)&&node.initializer){if(Object.hasOwn(found,node.name.text))throw Error('Duplicate catalog binding '+node.name.text);found[node.name.text]=literal(node.initializer);}ts.forEachChild(node,visit);}visit(file);}return found;}
export async function readCatalogs(root){const [hem,encyclopedia,added,artists]=await Promise.all(['pages/hem-atm.html','pages/plugin-encyclopedia.html','arena-production-references.json','artists-effects-chains.json'].map(name=>fs.readFile(new URL(name,root),'utf8')));return {...extractCatalogs(hem),...extractCatalogs(encyclopedia),added:JSON.parse(added),artists:JSON.parse(artists)};}
