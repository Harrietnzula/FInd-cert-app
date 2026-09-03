"""add user follows

Revision ID: 5a2d7c9e1b44
Revises: 3e6b9c2f1a44
"""
from alembic import op
import sqlalchemy as sa


revision = "5a2d7c9e1b44"
down_revision = "3e6b9c2f1a44"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "user_follows",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("follower_id", sa.Integer(), nullable=False),
        sa.Column("followed_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["follower_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["followed_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("follower_id", "followed_id", name="uq_user_follow"),
    )


def downgrade():
    op.drop_table("user_follows")