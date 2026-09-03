"""add artist follows and direct messages

Revision ID: 3e6b9c2f1a44
Revises: 2c91e4b7a630
"""
from alembic import op
import sqlalchemy as sa


revision = "3e6b9c2f1a44"
down_revision = "2c91e4b7a630"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "artist_follows",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("artist_id", sa.String(length=120), nullable=False),
        sa.Column("artist_name", sa.String(length=200), nullable=False),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "artist_id", name="uq_user_artist_follow"),
    )
    op.create_table(
        "direct_messages",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("sender_id", sa.Integer(), nullable=False),
        sa.Column("recipient_id", sa.Integer(), nullable=False),
        sa.Column("body", sa.String(length=1000), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["sender_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["recipient_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("direct_messages")
    op.drop_table("artist_follows")