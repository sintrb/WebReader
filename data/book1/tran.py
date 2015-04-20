#!/usr/bin/env python
# -*- coding: utf-8 -*-
# @Date    : 2015-04-20 20:58:52
# @Author  : Your Name (you@example.org)
# @Link    : http://example.org
# @Version : $Id$

import os
import json
book = {
	'id':1,
	'title':'有些失去，不曾离开',
	'parts':[]
}
part_no = 0
for fn in os.listdir("."):
	if fn.startswith("content") and fn.endswith(".json"):
		with open(fn) as f:
			pt = json.load(f)
			part = {
				'title': pt['title'],
				'contents': []
			}

			for cnt in pt['contents']:
				ncnt = {
					'id':cnt['id']
				}
				if cnt['type'] == 'paragraph':
					ncnt['type'] = 'text'
					ncnt['text'] = cnt['data']['text']
					ncnt['format'] = {
						'size': cnt['data']['format']['p_quote'] and 0.5 or 1,
						'align': cnt['data']['format']['p_align'],
						'italic': cnt['data']['format']['p_quote'],
						'bold': cnt['data']['format']['p_bold'],
						# 'indent': 0,
					}
				elif cnt['type'] == 'illus' and cnt['data']['seq']:
					ncnt['type'] = 'image'
					ncnt['src'] = 'data/book1/image/%s.bmp'%(cnt['data']['seq'])
					ncnt['single'] = True
					ncnt['format'] = {
						'width': cnt['data']['width'],
						'height': cnt['data']['height'],

						'align': 'center',
					}
				else:
					print cnt
				part['contents'].append(ncnt)

			with open('part%d.json'%part_no, 'w+') as nf:
				json.dump(part, nf)

			book['parts'].append({
				'id':part_no,
				'title':pt['title'],
				'level':0
				})

			part_no += 1

with open('book.json', 'w+') as f:
	json.dump(book, f)