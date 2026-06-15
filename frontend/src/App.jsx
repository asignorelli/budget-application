//based on this reference: https://vite.dev/guide/
//and these for reference too: https://react.dev/learn, 
// https://react.dev/learn/synchronizing-with-effects
// https://react.dev/learn/conditional-rendering

import { useState, useEffect } from 'react'
//backend reference
const API = 'http://127.0.0.1:5000'

export default function App() {

  //united states of budgetlandia
  const [cats, setCats] = useState([])
  const [purs, setPurs] = useState([])
  const [curForm, setCurForm] = useState(null)

  const [catName, setName] = useState('')
  const [catBudget, setBudget] = useState('')
  const [purDesc, setDesc] = useState('')
  const [purAmount, setAmount] = useState('')
  const [purDate, setDate] = useState('')
  const [purCatId, setCatId] = useState('')

  //funcs
  useEffect(() => {
    fetchCats()
    fetchPurs()
  }, [])

  async function fetchCats() {
    const res = await fetch(`${API}/categories/`)
    const data = await res.json()
    setCats(data)
  }

  async function fetchPurs() {
    const res = await fetch(`${API}/purchases/`)
    const data = await res.json()
    setPurs(data)
  }

  function catButton() {
    if (curForm == 'cat') {
      setCurForm(null)
    }
    else {
      setCurForm('cat')
    }
  }

  function purButton() {
    if (curForm == 'pur') {
      setCurForm(null)
    }
    else {
      setCurForm('pur')
    }
  }

  //based on example code cs1520_examples/react/re02_api_client/src/...
  async function submitCat() {
    let budgetVal = null
    if (catBudget) {
      budgetVal = parseInt(catBudget)
    }
    await fetch(`${API}/categories/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: catName, budget: budgetVal })
    })
    fetchCats()
    setName('')
    setBudget('')
    setCurForm(null)
  }

  async function submitPur() {
    await fetch(`${API}/purchases/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        desc: purDesc,
        amount: parseInt(purAmount),
        date: purDate,
        cat_id: parseInt(purCatId)
      })
    })
    fetchPurs()
    setDesc('')
    setAmount('')
    setDate('')
    setCatId('')
    setCurForm(null)
  }

  function overBudget(purchase) {
    const cat = cats.find(c => c.id === purchase.cat_id)
    if (!cat) {
      return false
    }
    if (cat.budget === null) {
      return false
    }

    const purchaseMonth = purchase.date.slice(0, 7)
    let total = 0

    for (let p of purs) {
      const pMonth = p.date.slice(0, 7)
      if (p.cat_id === purchase.cat_id && pMonth === purchaseMonth) {
        total = total + p.amount
      }
    }

    if (total > cat.budget) {
      return true
    }
    return false
  }

  //based on example code cs1520_examples/react/re02_api_client/src/...
  return (
    <div>
      <h1>Budgeting 101</h1>
      <button onClick={catButton}>Add new category</button>
      <button onClick={purButton}>Add new purchase</button>

      {curForm === 'cat' && (
        <div>
          <h3>New Category</h3>
          <input placeholder="Name" value={catName} onChange={e => setName(e.target.value)} required />
          <input placeholder="Budget" type="number" value={catBudget} onChange={e => setBudget(e.target.value)} />
          <button onClick={submitCat}>Submit</button>
        </div>
      )}

      {curForm === 'pur' && (
        <div>
          <h3>New Purchase</h3>
          <input placeholder="Description" value={purDesc} onChange={e => setDesc(e.target.value)} required />
          <input placeholder="Amount" type="number" value={purAmount} onChange={e => setAmount(e.target.value)} required />
          <input type="date" value={purDate} onChange={e => setDate(e.target.value)} required />
          <select value={purCatId} onChange={e => setCatId(e.target.value)} required>
            <option value="">Select Category</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={submitPur}>Submit</button>
        </div>
      )}

      <h2>Categories</h2>
      <ul>
        {cats.map(c => {
          let budgetDisplay
          if (c.budget === null) {
            budgetDisplay = 'No Limit'
          } 
          else {
            budgetDisplay = '$' + c.budget
          }
          return <li key={c.id}>{c.name} - {budgetDisplay}</li>
        })}
      </ul>
      <h2>Purchases</h2>
      <ul>
        {purs.map(p => {
          const cat = cats.find(c => c.id === p.cat_id)
          let catLabel
          if (cat) {
            catLabel = cat.name
          } 
          else {
            catLabel = 'Unknown'
          }
          let bgColor = 'transparent'
          if (overBudget(p)) {
            bgColor = 'red'
          }
          return (
            <li key={p.id} style={{ backgroundColor: bgColor }}>
              {p.date} - {p.desc} - ${p.amount} ({catLabel})
            </li>
          )
        })}
      </ul>

    </div>
  )
}
