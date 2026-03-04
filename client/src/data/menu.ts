// Menu data for De Gusta Pizzas
// Updated with real inventory + sizes + half-half support

export const CATEGORIES = [
  "Todas",
  "Queijos",
  "Calabresa",
  "Peixes",
  "Presunto"
];

export const MENU_ITEMS = [
  // 🧀 QUEIJOS
  {
    id: "57",
    category: "Queijos",
    name: "Mussarela",
    desc: "Mussarela + molho + orégano. Simplicidade perfeita.",
    price: 38.90,
    image: "https://private-us-east-1.manuscdn.com/sessionFile/81W8Zk7TDejeqI6GgAk22x/sandbox/ag1vmW330SFc8gMkxm3EVn-img-1_1771547752000_na1fn_cGl6emEtbXVzc2FyZWxh.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvODFXOFprN1REZWplcUk2R2dBazIyeC9zYW5kYm94L2FnMXZtVzMzMFNGYzhnTWt4bTNFVm4taW1nLTFfMTc3MTU0Nzc1MjAwMF9uYTFmbl9jR2w2ZW1FdGJYVnpjMkZ5Wld4aC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=AUMmZ2SAiJ-4rR6d7ytVusBAhdVFsP-388ED-o9wyVAgI5HGOnp-x4X-fuRAtbbvky2cTQLhxC-bZt~Ub3QwdTff30AZgBFlOt04ipC~5rKLSZbtDPcHycJbIEkgGBmlUMRyBeeupTJ01SYMbEZR6-3Xbemx0hZYBKG7ePGPBUSTIxdeRvdWn-QswU~iwfBkZ25Ux~DTcNUQfI5ZLB9Jwu7NFS2Ilofs7pSoDt57alPKtH8ovTq-oA4VNsD8JdFrP-QxjowUNqEZJ4MbYvZYhvQwhtvx6vesamEUfWo6X8h~FySXpCqJ6WGOXrmeTg7n6MpXV1JNQSsk2oUAJBuJEg__",
    badges: ["Clássica"],
    sizes: [
      { label: "P", price: 29.90 },
      { label: "M", price: 38.90 },
      { label: "G", price: 45.90 }
    ],
    allowHalf: true
  },
  {
    id: "58",
    category: "Queijos",
    name: "Margherita",
    desc: "Mussarela + tomate/molho + manjericão. A italiana perfeita.",
    price: 42.90,
    image: "https://private-us-east-1.manuscdn.com/sessionFile/81W8Zk7TDejeqI6GgAk22x/sandbox/ag1vmW330SFc8gMkxm3EVn-img-4_1771547766000_na1fn_cGl6emEtbWFyZ2hlcml0YQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvODFXOFprN1REZWplcUk2R2dBazIyeC9zYW5kYm94L2FnMXZtVzMzMFNGYzhnTWt4bTNFVm4taW1nLTRfMTc3MTU0Nzc2NjAwMF9uYTFmbl9jR2w2ZW1FdGJXRnlaMmhsY21sMFlRLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=XgH0a9PMYWfXjRFio-1YCf-PJ-cB65T7Ce-hVsWrt3Y7XKi3Y8v-2QNUxLjN3c6LzhVKMVhwyRtIia9sEZZ7xYBagtWBIzBkaBUCPWMt8nQ9ukHrz3-QYDgrqRWBjQ0UNEF8nUf4FUS1hNTB9xW9~MwkrQuDghdTEpT~T-lyhyYGNMFizq3bZDkpkM71MTyfWzogyi-Lr~3kXrB5OD3YTLt5kGJ8gfsmwKJzfsgQCykuGKDkwDhvY9nyX8f-LVe9LR7DMXfyxqI5A9I3HVgVREI0sKKI27Wc-f6Q65LiVgTWabgg8iYoRkJbsWz5pTQnMo~UgqQCQ-yQCWfM3szEGg__",
    badges: ["Sofisticada"],
    sizes: [
      { label: "P", price: 32.90 },
      { label: "M", price: 42.90 },
      { label: "G", price: 49.90 }
    ],
    allowHalf: true
  },
  {
    id: "61",
    category: "Queijos",
    name: "4 Queijos",
    desc: "Mussarela + requeijão tipo Catupiry + outros queijos. Cremosa e deliciosa.",
    price: 52.90,
    image: "https://private-us-east-1.manuscdn.com/sessionFile/81W8Zk7TDejeqI6GgAk22x/sandbox/ag1vmW330SFc8gMkxm3EVn-img-5_1771547768000_na1fn_cGl6emEtNC1xdWVpam9z.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvODFXOFprN1REZWplcUk2R2dBazIyeC9zYW5kYm94L2FnMXZtVzMzMFNGYzhnTWt4bTNFVm4taW1nLTVfMTc3MTU0Nzc2ODAwMF9uYTFmbl9jR2w2ZW1FdE5DMXhkV1ZwYW05ei5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=plPNTHMKcPMKPKWFlG6DCMG9Cx52m7LwkrKw4dFEW3nSzVUR82qLZ5csQC~u6OUfqAhha6TtSe7JmOO1pRBHU5YCdk1atgb9H2Syb-O1jFfAs7QOQZlcstNANjTWXNqI68MnVGbEXh4z7Ev1n1kDzVleSP8WD7lcz2--Nea6Sfzu9yPVUO8VUu~8SXBzecTXFne4Xql7upcqBS~cRV~ipLrBAK7oAO9pzaQmjpe2ll6imsx4fm1OLuSuKx-foRNdeoi6-PN4cKUt1A~PjMqsgqUifuX8oCS0KQf-vmaM6WjLhMixeYjeixwwNzuQa82SDqtdse4ckfDV7UJcF-mHvg__",
    badges: ["Premium"],
    sizes: [
      { label: "P", price: 39.90 },
      { label: "M", price: 52.90 },
      { label: "G", price: 62.90 }
    ],
    allowHalf: true
  },

  // 🌶️ CALABRESA
  {
    id: "12",
    category: "Calabresa",
    name: "Calabresa",
    desc: "Calabresa + cebola + mussarela. A rainha de SP.",
    price: 42.90,
    image: "https://private-us-east-1.manuscdn.com/sessionFile/81W8Zk7TDejeqI6GgAk22x/sandbox/ag1vmW330SFc8gMkxm3EVn-img-2_1771547768000_na1fn_cGl6emEtY2FsYWJyZXNh.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvODFXOFprN1REZWplcUk2R2dBazIyeC9zYW5kYm94L2FnMXZtVzMzMFNGYzhnTWt4bTNFVm4taW1nLTJfMTc3MTU0Nzc2ODAwMF9uYTFmbl9jR2w2ZW1FdFkyRnNZV0p5WlhOaC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=KIAiVFOX7VuXUOpOZykKIh6ZY-18sGv4Qf3hC7PHPvbWNzVcPfmfBlOX9iEBzxANjnemotTF6DcCMPEn1OhwnBgbZAz5p9HHoOBBW6V-gaJN0Y0KhadZrLEug--lTkrm9T-xXYBj9LArLLpSG-5NRfgNzoU8TB6WHxeRkB4URfVOZbraeGDAM8aZJ9nzAwBG0vqh5XJ~38Ub2mJUhY~qHPdYggrXrwOLbnkjCjVXC5LX7TJ2b0WDGfALhNK2xXATBhhN4JskBXNrSSquD-~GWt5gIx0WmQeZsDo2gSQcgmEs4sqWxFjDZFDIvzudrU7~1NQpQfRXvEkzVFbyNL3gxA__",
    badges: ["Mais Pedida"],
    sizes: [
      { label: "P", price: 32.90 },
      { label: "M", price: 42.90 },
      { label: "G", price: 49.90 }
    ],
    allowHalf: true
  },
  {
    id: "13",
    category: "Calabresa",
    name: "Baiana",
    desc: "Calabresa + cebola + pimenta + mussarela. Para quem gosta de emoção.",
    price: 44.90,
    image: "https://private-us-east-1.manuscdn.com/sessionFile/81W8Zk7TDejeqI6GgAk22x/sandbox/ag1vmW330SFc8gMkxm3EVn-img-3_1771547757000_na1fn_cGl6emEtYmFpYW5h.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvODFXOFprN1REZWplcUk2R2dBazIyeC9zYW5kYm94L2FnMXZtVzMzMFNGYzhnTWt4bTNFVm4taW1nLTNfMTc3MTU0Nzc1NzAwMF9uYTFmbl9jR2w2ZW1FdFltRnBZVzVoLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=HDzjU2RI-NEs7QcxOyPOdyu7SR1YXeMWVlHRZ-HGfZm950C5EkskjCQNdO8SlFZbnhsGBz8CxmryKNxv6uXMvIlNacVXBBzvvKhihl3pytu6Q2DguvidvDvGemMqjWaiBwN48uK6i1MOKdAGALW~8bCfZx5aTzg8hx~bkHX3TBud0Vv2VRXFHEi3EIazVCup3QqomJfvzMOraTP45kpV0v1FqUstdUIdogWGyPxaabktKXx9H1YTAQLW3coFZc5r3wB~WBnk5UXhKgL3b7PbXVc3r0Q24IRNym-Wh0MAHlVsarCxOxen7QpP8rvWE9loScrUTj-iYmRxogQNgIUqxg__",
    badges: ["Picante"],
    sizes: [
      { label: "P", price: 34.90 },
      { label: "M", price: 44.90 },
      { label: "G", price: 52.90 }
    ],
    allowHalf: true
  },
  {
    id: "20",
    category: "Calabresa",
    name: "Toscana",
    desc: "Calabresa + cebola + queijo. Combinação perfeita.",
    price: 46.90,
    image: "https://private-us-east-1.manuscdn.com/sessionFile/81W8Zk7TDejeqI6GgAk22x/sandbox/ljspewQXnFtsD3oCxGXrhR-img-3_1771547842000_na1fn_cGl6emEtdG9zY2FuYQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvODFXOFprN1REZWplcUk2R2dBazIyeC9zYW5kYm94L2xqc3Bld1FYbkZ0c0Qzb0N4R1hyaFItaW1nLTNfMTc3MTU0Nzg0MjAwMF9uYTFmbl9jR2w2ZW1FdGRHOXpZMkZ1WVEucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=qOw2rNIMcrTkeAK8iuasx7w~4zQ9KyBNLy8RIbR5dKOeNudmd5C2S8F7FW3K7F0QFHXHaQIFNEOyjN~WzugfzCJy7FWhRTUOmFN9pkDwjCh2bkG4xUEmeP5JvwvMmDaVqrewB~aLMD65gd97MMwvsvvD7N5n2nqh5wC1W1AlRJJlsHqX9X-TVfes-IDm7Il5uzQvNcMbDyzb2PPcbJ5Wq~lP62FbUoAEeihwlG0O9x9skNAKF8EUORzBmrzj-9az9wGqgpVu7QrT0EOstbVFUn1dOIuxsox3AZXO8KF27mpiXx1SDCRQvwvtxsBpFpH-t2RDNpRgoR69eL-7dpM6Fg__",
    badges: ["Especial"],
    sizes: [
      { label: "P", price: 35.90 },
      { label: "M", price: 46.90 },
      { label: "G", price: 54.90 }
    ],
    allowHalf: true
  },

  // 🐟 PEIXES
  {
    id: "01",
    category: "Peixes",
    name: "Atum",
    desc: "Atum + cebola. Sabor marcante.",
    price: 45.90,
    image: "https://private-us-east-1.manuscdn.com/sessionFile/81W8Zk7TDejeqI6GgAk22x/sandbox/ljspewQXnFtsD3oCxGXrhR-img-1_1771547842000_na1fn_cGl6emEtYXR1bQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvODFXOFprN1REZWplcUk2R2dBazIyeC9zYW5kYm94L2xqc3Bld1FYbkZ0c0Qzb0N4R1hyaFItaW1nLTFfMTc3MTU0Nzg0MjAwMF9uYTFmbl9jR2w2ZW1FdFlYUjFiUS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=paQM2yB8wpah0poNFM5I3eh5lPIPtZokJN9knv26QUdmstP~tibPouUcW0UFQlGYtzWvf-sN825Gjdp0hv6XqR7nZ1MPBlnpUwJc5YfLDFmb6eJ8URibyw~t2KUWSTPdzyGefYSrDG0OzmtsVLl9AoHp1cJWxcQ0KwWiI3~cJGazVNvnh3sclK-CLxCYoYoIbdPJOrMMDdq9-tWpi1E~wJ~nFKgZWpn8NKDGE9kt4M7fvVxB4lHfiP1TZI4QHGMQkxPoSj7cngD6Hq8Xabtv-HylqtSCJ528omIF-hswkNUx~GK5wf7s8EHkL5k8NfD~0ZiLSU6YYTb6zSI3SG4zew__",
    badges: ["Clássica"],
    sizes: [
      { label: "P", price: 35.90 },
      { label: "M", price: 45.90 },
      { label: "G", price: 54.90 }
    ],
    allowHalf: true
  },
  {
    id: "02",
    category: "Peixes",
    name: "Atum Cheese",
    desc: "Atum + mussarela. Combinação deliciosa.",
    price: 47.90,
    image: "https://private-us-east-1.manuscdn.com/sessionFile/81W8Zk7TDejeqI6GgAk22x/sandbox/ljspewQXnFtsD3oCxGXrhR-img-4_1771547831000_na1fn_cGl6emEtYXR1bS1jaGVlc2U.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvODFXOFprN1REZWplcUk2R2dBazIyeC9zYW5kYm94L2xqc3Bld1FYbkZ0c0Qzb0N4R1hyaFItaW1nLTRfMTc3MTU0NzgzMTAwMF9uYTFmbl9jR2w2ZW1FdFlYUjFiUzFqYUdWbGMyVS5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=gnRJABdXJ02JWx-0PiKpsobSrdSB2SK0vLqt150kRy7fgpoW3hTT9WvguMaKIowYCmJ~6LS1d8IaokLpXtm9Bu564mj8yZID9ibx2nyhQPyaLXqbnqKr-bSzhaIfxP80ck0MQeC3Jpz7vPwNpNQeMj8xZis1YgRXHQVzKa8xUt1-Og0c7IUvY4q5cqjSvpnNqYgzi2wVWoAgJJq7iG-thT~3MHFli4n-x2II1EEoT467iW1wp4UVndRXxyA8IU12Gl3uM7KDXAyUKBQDXoeUSA8y7bDhW8CpFWy3f1ppmHljuEpXc2MQl3O~K939RNV~1l5ZRF5ISjQe10COBCeRAw__",
    badges: ["Premium"],
    sizes: [
      { label: "P", price: 37.90 },
      { label: "M", price: 47.90 },
      { label: "G", price: 56.90 }
    ],
    allowHalf: true
  },
  {
    id: "06",
    category: "Peixes",
    name: "Espanhola",
    desc: "Atum + bacon. O verdadeiro luxo.",
    price: 52.90,
    image: "https://private-us-east-1.manuscdn.com/sessionFile/81W8Zk7TDejeqI6GgAk22x/sandbox/ljspewQXnFtsD3oCxGXrhR-img-5_1771547842000_na1fn_cGl6emEtZXNwYW5ob2xh.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvODFXOFprN1REZWplcUk2R2dBazIyeC9zYW5kYm94L2xqc3Bld1FYbkZ0c0Qzb0N4R1hyaFItaW1nLTVfMTc3MTU0Nzg0MjAwMF9uYTFmbl9jR2w2ZW1FdFpYTndZVzVvYjJ4aC5wbmc~eC1vc3MtcHJvY2Vzcz1pbWFnZS9yZXNpemUsd18xOTIwLGhfMTkyMC9mb3JtYXQsd2VicC9xdWFsaXR5LHFfODAiLCJDb25kaXRpb24iOnsiRGF0ZUxlc3NUaGFuIjp7IkFXUzpFcG9jaFRpbWUiOjE3OTg3NjE2MDB9fX1dfQ__&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=n3kz2L8qVPsOUYGBHkERYjQBFJAw4s~LZbfHpMxvjh~ZwJVJzf5OVXc~zVKLEwlBV67e0UiV0xkA8-4nh1qau1vVQmbh6t8Z62vi6mho2rxdf1q0lvVQE01A69KMILxQhB43ODTlU-COxrr9BKgum7CKZ0LA8M5xDDx8rTdSueUHU4DHrqez16MuEmnmm38XLDChDnsskF-lpoGq9I2Z2e2OtsR0cccjUGRRtgJ1RtazHPvCBVCZy99taSCKlXuveCCnLESkiImMwloDRetwEZfnMGWOzPkI9D~nkqW4tfSb7osavpKBdK601eAV8SFWokOhBjcMIR3k4Wc56scMaw__",
    badges: ["Gourmet"],
    sizes: [
      { label: "P", price: 42.90 },
      { label: "M", price: 52.90 },
      { label: "G", price: 62.90 }
    ],
    allowHalf: true
  },

  // 🍖 PRESUNTO
  {
    id: "27",
    category: "Presunto",
    name: "Portuguesa",
    desc: "Presunto + cebola. Clássica que todos amam.",
    price: 46.90,
    image: "https://private-us-east-1.manuscdn.com/sessionFile/81W8Zk7TDejeqI6GgAk22x/sandbox/ljspewQXnFtsD3oCxGXrhR-img-2_1771547835000_na1fn_cGl6emEtcG9ydHVndWVzYQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvODFXOFprN1REZWplcUk2R2dBazIyeC9zYW5kYm94L2xqc3Bld1FYbkZ0c0Qzb0N4R1hyaFItaW1nLTJfMTc3MTU0NzgzNTAwMF9uYTFmbl9jR2w2ZW1FdGNHOXlkSFZuZFdWellRLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=VujQXbj4rDi2yTSqs3EePbsuVJjzJt2g19xqiOz0qsm9XXIdy~Fuovs0fKPbfxMqLINpz0wO8tWrRh806YR0IyrwIBz-XqBLgcZB6jegr5gKMpK6OEDWh0FaeoR60FdtX2JURMLhg6bYcxUvtNnfKSWGK7f0FNpS7s0P5rJjA-MUGwNR4vo6guc448tpm1gITJRy4e3~q5ntdYfCCoWAKQ61g59BUwAJ3C~uVz7EltVikCRcR03rRd6ACZ0BLOiqag64u998mswlEa9dRnUResT6RVu9Evj1p2mBeaGOGXX2OzdVi64ARq30~wdg4OlPXwGFi53~JN4Q7Nj8wFi~uA__",
    badges: ["Tradicional"],
    sizes: [
      { label: "P", price: 35.90 },
      { label: "M", price: 46.90 },
      { label: "G", price: 54.90 }
    ],
    allowHalf: false
  },
  {
    id: "31",
    category: "Presunto",
    name: "Moda da Casa",
    desc: "Presunto + abobrinha. Promoção especial!",
    price: 29.90,
    image: "https://private-us-east-1.manuscdn.com/sessionFile/81W8Zk7TDejeqI6GgAk22x/sandbox/ljspewQXnFtsD3oCxGXrhR-img-2_1771547835000_na1fn_cGl6emEtcG9ydHVndWVzYQ.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvODFXOFprN1REZWplcUk2R2dBazIyeC9zYW5kYm94L2xqc3Bld1FYbkZ0c0Qzb0N4R1hyaFItaW1nLTJfMTc3MTU0NzgzNTAwMF9uYTFmbl9jR2w2ZW1FdGNHOXlkSFZuZFdWellRLnBuZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=VujQXbj4rDi2yTSqs3EePbsuVJjzJt2g19xqiOz0qsm9XXIdy~Fuovs0fKPbfxMqLINpz0wO8tWrRh806YR0IyrwIBz-XqBLgcZB6jegr5gKMpK6OEDWh0FaeoR60FdtX2JURMLhg6bYcxUvtNnfKSWGK7f0FNpS7s0P5rJjA-MUGwNR4vo6guc448tpm1gITJRy4e3~q5ntdYfCCoWAKQ61g59BUwAJ3C~uVz7EltVikCRcR03rRd6ACZ0BLOiqag64u998mswlEa9dRnUResT6RVu9Evj1p2mBeaGOGXX2OzdVi64ARq30~wdg4OlPXwGFi53~JN4Q7Nj8wFi~uA__",
    badges: ["Promoção"],
    sizes: [
      { label: "P", price: 19.90 },
      { label: "M", price: 29.90 },
      { label: "G", price: 35.90 }
    ],
    allowHalf: false
  }
];
