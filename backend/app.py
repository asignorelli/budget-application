from flask import Flask, flash, redirect, render_template, request, session, url_for
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import ForeignKey
import click
from typing import Optional
from flask_cors import CORS
from flask import Flask, jsonify

class Base(DeclarativeBase):
  pass

#---set up stuff for flash n database, based on example code (and my project 2 code)--
app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///budget.db'

app.secret_key = "hi_grader_TA" #hi grader

#---------models------------------
#based from: https://flask-sqlalchemy.palletsprojects.com/en/stable/models/
db = SQLAlchemy(model_class=Base)
db.init_app(app)

class Category(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column()
    budget: Mapped[Optional[int]] = mapped_column(nullable=True)
    #func to convert to JSON
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "budget": self.budget
        }

class Purchase(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    desc: Mapped[str] = mapped_column()
    amount: Mapped[int] = mapped_column()
    date: Mapped[str]= mapped_column()
    cat_id: Mapped[int]=mapped_column(ForeignKey("category.id"))
    #func to convert to JSON
    def to_dict(self):
        return {
            "id": self.id,
            "desc": self.desc,
            "amount": self.amount,
            "date": self.date,
            "cat_id": self.cat_id
        }

#initalize database
@app.cli.command("initdb")
def initdb():
    db.drop_all()
    db.create_all()
    other = Category(name="Other", budget=None)
    db.session.add(other)
    db.session.commit()
    click.echo("DATABASE. INITILIAZED. BEEP. BOP.")

#--------------------------------------
#-----------ROUTES---------------------
#--------------------------------------
#this site was referenced: https://www.geeksforgeeks.org/python/flask-http-methods-handle-get-post-requests/
#and then of course my project 2 and 3

#-----------CATEGORIES------------------------

#HTTP GET /catergories/
@app.route("/categories/", methods=["GET"])
def return_cats(): #meow
    cat_list=Category.query.order_by(Category.id.asc()).all()
    cat_list_JSON=[]
    for cats in cat_list:
        cat_list_JSON.append(cats.to_dict())
    return jsonify(cat_list_JSON)

#HTTP POST /categories/
@app.route("/categories/", methods=["POST"])
def new_cats(): #new meow
    data=request.get_json()
    new_cat = Category(name=data.get("name"), budget=data.get("budget"))
    db.session.add(new_cat)
    db.session.commit()
    return jsonify(new_cat.to_dict()), 201

#HTTP GET /catergories/<cat_id_here>
@app.route("/categories/<int:cat_id>", methods=["GET"])
def return_cat(cat_id): #meow
    cat=Category.query.get(cat_id)
    if cat:
        return jsonify(cat.to_dict())
    else:
        return jsonify({"error":"Category not found"}),404 


#------------------------PURCHASES-----------------------------
#HTTP GET /purchases/
@app.route("/purchases/", methods=["GET"])
def return_purs(): #purrrrr
    pur_list=Purchase.query.order_by(Purchase.date.desc()).all()
    pur_list_JSON=[]
    for purs in pur_list:
        pur_list_JSON.append(purs.to_dict())
    return jsonify(pur_list_JSON)

#HTTP POST /purchases/
@app.route("/purchases/", methods=["POST"])
def new_pur(): #new meow
    data=request.get_json()
    new_pur = Purchase(desc=data.get("desc"), amount=data.get("amount"), date=data.get("date"), cat_id=data.get("cat_id"))
    db.session.add(new_pur)
    db.session.commit()
    return jsonify(new_pur.to_dict()), 201

#HTTP GET /purchases/<pur_id_here>
@app.route("/purchases/<int:pur_id>", methods=["GET"])
def return_pur(pur_id): #meow
    pur=Purchase.query.get(pur_id)
    if pur:
        return jsonify(pur.to_dict())
    else:
        return jsonify({"error":"Purchase not found"}),404 

#and fix server connection
if __name__=="__main__":
    app.run(debug=True, port=5000)