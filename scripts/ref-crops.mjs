// LOCAL CONCEPT ONLY: crops third-party reference photos (static/ref/osma, git-ignored) into
// static/ref/crop so the layout can be judged with human imagery. Never committed or deployed.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const S = 'static/ref/osma';
const O = 'static/ref/crop';
mkdirSync(O, { recursive: true });

const crops = {
	'crowd-group': ['04', { left: 30, top: 25, width: 630, height: 470 }],
	'customer-left': ['04', { left: 55, top: 512, width: 262, height: 262 }],
	'customer-right': ['04', { left: 372, top: 425, width: 262, height: 262 }],
	'queue-tall': ['10', { left: 0, top: 0, width: 340, height: 450 }],
	'queue-wide': ['16', { left: 0, top: 0, width: 688, height: 450 }],
	'booth-customer': ['13', { left: 0, top: 40, width: 688, height: 420 }],
	'pour': ['19', { left: 20, top: 0, width: 650, height: 780 }],
	'courier': ['22', { left: 0, top: 0, width: 688, height: 430 }],
	'team-group': ['23', { left: 40, top: 20, width: 620, height: 420 }],
	'founder': ['23', { left: 240, top: 30, width: 170, height: 212 }],
	'admin-1': ['23', { left: 470, top: 40, width: 130, height: 130 }],
	'admin-2': ['23', { left: 125, top: 70, width: 130, height: 130 }],
	'chat-1': ['20', { left: 30, top: 60, width: 300, height: 690 }],
	'chat-2': ['20', { left: 365, top: 60, width: 300, height: 690 }],
	'chat-3': ['11', { left: 0, top: 0, width: 330, height: 554 }]
};

for (const [name, [src, crop]] of Object.entries(crops)) {
	await sharp(`${S}/${src}.webp`).extract(crop).webp({ quality: 82 }).toFile(`${O}/${name}.webp`);
	console.log('ok', name);
}
