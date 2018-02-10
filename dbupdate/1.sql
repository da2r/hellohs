CREATE TABLE IF NOT EXISTS app_data
(
  id bigint NOT NULL,
  ver bigint,
  CONSTRAINT app_data_pk PRIMARY KEY (id)
)

INSERT INTO app_data(id, ver) VALUES (1, 0) ON CONFLICT DO NOTHING

-- table item --
CREATE SEQUENCE IF NOT EXISTS item_id_seq

CREATE TABLE IF NOT EXISTS item
(
  id bigint NOT NULL DEFAULT nextval('item_id_seq'),
  name text NOT NULL,
	dept text NOT NULL,
	note text,
	CONSTRAINT item_pk PRIMARY KEY (id),
	CONSTRAINT item_name_ux UNIQUE (name)
)

CREATE INDEX IF NOT EXISTS item_name_idx ON item USING btree(name)

-- table sales_invoice --
CREATE SEQUENCE IF NOT EXISTS sales_invoice_id_seq

CREATE TABLE IF NOT EXISTS sales_invoice
(
  id bigint NOT NULL DEFAULT nextval('sales_invoice_id_seq'),
	trans_date date,
	create_time timestamp without time zone,
	cash boolean DEFAULT false,
	bill_to text,
	phone text,
	note text,
	amount bigint,
	down_payment bigint DEFAULT 0,
	owing bigint,
	payment bigint DEFAULT 0,
	paid boolean DEFAULT true,
	CONSTRAINT sales_invoice_pk PRIMARY KEY (id)
)

-- table sales_invoice_item --
CREATE SEQUENCE IF NOT EXISTS sales_invoice_item_id_seq

CREATE TABLE IF NOT EXISTS sales_invoice_item
(
  id bigint NOT NULL DEFAULT nextval('sales_invoice_item_id_seq'),
	master_id bigint NOT NULL,
	item_id bigint,
	quantity bigint,
	amount bigint,
	CONSTRAINT sales_invoice_item_pk PRIMARY KEY (id),
	CONSTRAINT sales_invoice_item_master_id_fk FOREIGN KEY (master_id) REFERENCES sales_invoice(id),
	CONSTRAINT sales_invoice_item_id_fk FOREIGN KEY (item_id) REFERENCES item(id)
)

-- table sales_payment --
CREATE SEQUENCE IF NOT EXISTS sales_payment_id_seq

CREATE TABLE IF NOT EXISTS sales_payment
(
  id bigint NOT NULL DEFAULT nextval('sales_payment_id_seq'),
	master_id bigint NOT NULL,
	trans_date date,
	create_time timestamp without time zone,
	amount bigint,
	notes text,
	CONSTRAINT sales_payment_pk PRIMARY KEY (id),
	CONSTRAINT sales_payment_master_id_fk FOREIGN KEY (master_id) REFERENCES sales_invoice(id)
)
