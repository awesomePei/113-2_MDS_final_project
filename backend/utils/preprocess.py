import pandas as pd
import joblib
import os

def preprocess_uploaded_dataframe(df: pd.DataFrame, encoder_path) -> pd.DataFrame:
    """
    Preprocesses an uploaded DataFrame by dropping irrelevant columns
    and transforming 'shipping date (DateOrders)' and 'order date (DateOrders)'
    into separate year, month, day, hour, and weekday columns.

    Args:
        df (pd.DataFrame): The input DataFrame from the uploaded CSV.

    Returns:
        pd.DataFrame: The preprocessed DataFrame.
    """

    # Drop clearly unnecessary columns upfront
    df.drop(columns=[
        "Customer Id", "Customer Password", "Customer Fname", "Customer Lname",
        "Customer Email", "Product Image", "Customer Street", "Order City",
        "Order State", "Order Zipcode", "Product Description",
        "Late_delivery_risk", "Delivery Status", "Days for shipping (real)"
    ], inplace=True, errors='ignore')

    # Convert shipping dates to datetime and extract parts
    df['DateOrders'] = pd.to_datetime(df['shipping date (DateOrders)'], errors='coerce')
    df['ShippingYear'] = df['DateOrders'].dt.year
    df['ShippingMonth'] = df['DateOrders'].dt.month
    df['ShippingDay'] = df['DateOrders'].dt.day
    df['ShippingHour'] = df['DateOrders'].dt.hour
    df['ShippingWeekday'] = df['DateOrders'].dt.weekday
    df.drop(columns=['shipping date (DateOrders)', 'DateOrders'], inplace=True)

    # Convert order dates to datetime and extract parts
    df['order date (DateOrders)'] = pd.to_datetime(df['order date (DateOrders)'], errors='coerce')
    df['OrderYear'] = df['order date (DateOrders)'].dt.year
    df['OrderMonth'] = df['order date (DateOrders)'].dt.month
    df['OrderDay'] = df['order date (DateOrders)'].dt.day
    df['OrderHour'] = df['order date (DateOrders)'].dt.hour
    df['OrderWeekday'] = df['order date (DateOrders)'].dt.weekday
    df.drop(columns=['order date (DateOrders)'], inplace=True)

    print("Columns before encoding")
    print(len(df.columns))
    print(df.columns)

    obj_cols = df.select_dtypes(include='object').columns
    encoder = joblib.load(encoder_path)
    obj_encoded = encoder.transform(df[obj_cols])
    obj_encoded_df = pd.DataFrame(obj_encoded, columns=encoder.get_feature_names_out(obj_cols), index=df.index)

    # Drop original object columns and concatenate encoded ones
    df.drop(columns=obj_cols, inplace=True)
    df_final = pd.concat([df.reset_index(drop=True), obj_encoded_df.reset_index(drop=True)], axis=1)

    # Final overview
    print(f"Final shape: {df_final.shape}")

    return df_final