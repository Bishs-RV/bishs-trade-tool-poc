-- Create trade_tool schema
CREATE SCHEMA IF NOT EXISTS trade_tool;

-- Create trade_evaluations table
CREATE TABLE IF NOT EXISTS trade_tool.trade_evaluations (
    id SERIAL PRIMARY KEY,

    -- Customer Info
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,

    -- Unit Data
    stock_number TEXT,
    location TEXT,
    year INTEGER,
    make TEXT,
    model TEXT,
    vin TEXT,
    rv_type TEXT,
    mileage INTEGER,

    -- JD Power Data
    jd_power_model_trim_id INTEGER,
    jd_power_manufacturer_id INTEGER,

    -- Condition Data
    condition_score INTEGER,
    major_issues TEXT,
    unit_add_ons TEXT,
    additional_prep_cost NUMERIC(10, 2),

    -- Market Data
    avg_listing_price NUMERIC(10, 2),

    -- Valuation Inputs
    trade_in_percent NUMERIC(5, 4),
    target_margin_percent NUMERIC(5, 4),
    retail_price_source TEXT,
    custom_retail_value NUMERIC(10, 2),

    -- Calculated Outputs
    jd_power_trade_in NUMERIC(10, 2),
    jd_power_retail_value NUMERIC(10, 2),
    pdi_cost NUMERIC(10, 2),
    recon_cost NUMERIC(10, 2),
    sold_prep_cost NUMERIC(10, 2),
    total_prep_costs NUMERIC(10, 2),
    bish_tiv_base NUMERIC(10, 2),
    total_unit_costs NUMERIC(10, 2),
    avg_comp_price NUMERIC(10, 2),
    calculated_retail_price NUMERIC(10, 2),
    replacement_cost NUMERIC(10, 2),
    active_retail_price NUMERIC(10, 2),
    final_trade_offer NUMERIC(10, 2),
    calculated_margin_amount NUMERIC(10, 2),
    calculated_margin_percent NUMERIC(5, 4),

    -- Notes
    valuation_notes TEXT,

    -- Audit Fields
    created_by TEXT NOT NULL,
    updated_by TEXT NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_trade_evaluations_vin
    ON trade_tool.trade_evaluations (vin);

CREATE INDEX IF NOT EXISTS idx_trade_evaluations_stock_number
    ON trade_tool.trade_evaluations (stock_number);

CREATE INDEX IF NOT EXISTS idx_trade_evaluations_created_date
    ON trade_tool.trade_evaluations (created_date);

-- Create trigger function for auto-updating updated_date
CREATE OR REPLACE FUNCTION trade_tool.update_updated_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_date = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS set_updated_date ON trade_tool.trade_evaluations;
CREATE TRIGGER set_updated_date
    BEFORE UPDATE ON trade_tool.trade_evaluations
    FOR EACH ROW
    EXECUTE FUNCTION trade_tool.update_updated_date();
